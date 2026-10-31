export type Point = [number, number];

function niceStep(span: number, count: number): number {
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const error = raw / power;
  return power * (error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1);
}

const round = (v: number) => +v.toPrecision(12);

export interface LinearOptions {
  count: number;
  start?: string | null;
  end?: string | null;
  values?: number[] | null;
}

export function linearTicks(min: number, max: number, o: LinearOptions): { domain: Point; ticks: number[] } {
  if (o.values?.length) {
    let [lo, hi] = [min, max];
    for (const v of o.values) [lo, hi] = [Math.min(lo, v), Math.max(hi, v)];
    return { domain: [lo, hi], ticks: o.values };
  }
  const fixed = (v: string | null | undefined) => (v != null && v !== "" && !isNaN(+v) ? +v : null);
  const start = o.start === "min" ? min : fixed(o.start);
  const end = o.end === "max" ? max : fixed(o.end);
  let lo = start ?? Math.min(0, min);
  let hi = end ?? Math.max(0, max);
  if (hi <= lo) hi = lo + 1;
  let step = NaN;
  for (let i = 0; i < 10; i++) {
    const next = niceStep(hi - lo, o.count);
    if (next === step) break;
    step = next;
    if (start === null) lo = Math.floor(lo / step) * step;
    if (end === null) hi = Math.ceil(hi / step) * step;
  }
  const ticks: number[] = [];
  for (let k = Math.ceil(round(lo / step)); k * step <= hi + step * 1e-9; k++) ticks.push(round(k * step));
  return { domain: [round(lo), round(hi)], ticks };
}

type Unit = "s" | "m" | "h" | "d" | "w" | "M" | "y";

const UNIT_MS: Record<Unit, number> = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5, M: 2592e6, y: 31536e6 };

export const INTERVALS: [Unit, number][] = [
  ["s", 1], ["s", 5], ["s", 15], ["s", 30],
  ["m", 1], ["m", 5], ["m", 15], ["m", 30],
  ["h", 1], ["h", 3], ["h", 6], ["h", 12],
  ["d", 1], ["d", 2], ["d", 3], ["w", 1],
  ["M", 1], ["M", 3], ["y", 1], ["y", 2], ["y", 5], ["y", 10],
];

export const intervalMs = ([unit, step]: [Unit, number]) => UNIT_MS[unit] * step;

export function tickFormat(t: number, context?: { year: boolean; date: boolean }): Intl.DateTimeFormatOptions {
  const d = new Date(t);
  const year = context?.year ? ({ year: "numeric" } as const) : {};
  const date = context?.date ? ({ month: "short", day: "numeric" } as const) : {};
  if (d.getSeconds() || d.getMilliseconds()) return { ...date, hour: "numeric", minute: "2-digit", second: "2-digit" };
  if (d.getMinutes()) return { ...date, hour: "numeric", minute: "2-digit" };
  if (d.getHours()) return { ...date, hour: "numeric" };
  if (d.getDate() !== 1) return { month: "short", day: "numeric", ...year };
  if (d.getMonth()) return { month: "short", ...year };
  return { year: "numeric" };
}

// Fixed durations below a day, so DST never skips or repeats an hour.
export function timeTicks(t0: number, t1: number, [unit, step]: [Unit, number], limit = 1000): number[] {
  const d = new Date(t0);
  if (unit === "s") d.setSeconds(Math.floor(d.getSeconds() / step) * step, 0);
  if (unit === "m") d.setMinutes(Math.floor(d.getMinutes() / step) * step, 0, 0);
  if (unit === "h") d.setHours(Math.floor(d.getHours() / step) * step, 0, 0, 0);
  if (unit === "d" || unit === "w" || unit === "M" || unit === "y") d.setHours(0, 0, 0, 0);
  if (unit === "w") d.setDate(d.getDate() - d.getDay());
  if (unit === "M" || unit === "y") d.setDate(1);
  if (unit === "M") d.setMonth(Math.floor(d.getMonth() / step) * step);
  if (unit === "y") d.setFullYear(Math.floor(d.getFullYear() / step) * step, 0);
  const ticks: number[] = [];
  for (let i = 0; ticks.length < limit && i < 10000 && d.getTime() <= t1; i++) {
    if (d.getTime() >= t0) ticks.push(d.getTime());
    if (unit === "s" || unit === "m" || unit === "h") d.setTime(d.getTime() + UNIT_MS[unit] * step);
    if (unit === "d") d.setDate(d.getDate() + step);
    if (unit === "w") d.setDate(d.getDate() + 7 * step);
    if (unit === "M") d.setMonth(d.getMonth() + step);
    if (unit === "y") d.setFullYear(d.getFullYear() + step);
  }
  return ticks;
}

// "2026-10-31" is a local date, not UTC midnight as Date.parse reads it.
export function toTime(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return isFinite(value) ? value : NaN;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return NaN;
  const day = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return day ? new Date(+day[1], +day[2] - 1, +day[3]).getTime() : Date.parse(value);
}

const f = (n: number) => +n.toFixed(2);

// Monotone, so a curve never overshoots its values.
export function linePath(points: Point[], smooth: boolean, swapped: boolean): string {
  const n = points.length;
  const xy = (a: number, b: number) => (swapped ? `${f(b)} ${f(a)}` : `${f(a)} ${f(b)}`);
  if (n < 3 || !smooth) return points.map(([a, b], i) => `${i ? "L" : "M"}${xy(a, b)}`).join("");
  const sign = (v: number) => (v < 0 ? -1 : 1);
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    slopes.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0] || 1));
  }
  const tangents = [0];
  for (let i = 1; i < n - 1; i++) {
    const h0 = points[i][0] - points[i - 1][0];
    const h1 = points[i + 1][0] - points[i][0];
    const [s0, s1] = [slopes[i - 1], slopes[i]];
    const p = (s0 * h1 + s1 * h0) / (h0 + h1 || 1);
    tangents.push((sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0);
  }
  tangents[0] = (3 * slopes[0] - tangents[1]) / 2;
  tangents.push((3 * slopes[n - 2] - tangents[n - 2]) / 2);
  let d = `M${xy(points[0][0], points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${xy(x0 + h, y0 + h * tangents[i])} ${xy(x1 - h, y1 - h * tangents[i + 1])} ${xy(x1, y1)}`;
  }
  return d;
}

export function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: number[]): string {
  const max = Math.min(w, h) / 2;
  [tl, tr, br, bl] = [tl, tr, br, bl].map((r) => Math.max(0, Math.min(r, max)));
  const arc = (r: number, ex: number, ey: number) => (r ? `A${f(r)} ${f(r)} 0 0 1 ${f(ex)} ${f(ey)}` : "");
  return (
    `M${f(x + tl)} ${f(y)}H${f(x + w - tr)}${arc(tr, x + w, y + tr)}` +
    `V${f(y + h - br)}${arc(br, x + w - br, y + h)}` +
    `H${f(x + bl)}${arc(bl, x, y + h - bl)}` +
    `V${f(y + tl)}${arc(tl, x + tl, y)}Z`
  );
}

export function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const at = (r: number, a: number) => `${f(cx + r * Math.sin(a))} ${f(cy - r * Math.cos(a))}`;
  const sweep = a1 - a0;
  if (sweep >= Math.PI * 2 - 1e-6) {
    const ring = (r: number, dir: number) =>
      r ? `M${at(r, 0)}A${f(r)} ${f(r)} 0 1 ${dir} ${at(r, Math.PI)}A${f(r)} ${f(r)} 0 1 ${dir} ${at(r, 0)}Z` : "";
    return ring(r1, 1) + ring(r0, 0);
  }
  const large = sweep > Math.PI ? 1 : 0;
  const d = `M${at(r1, a0)}A${f(r1)} ${f(r1)} 0 ${large} 1 ${at(r1, a1)}`;
  if (!r0) return `${d}L${f(cx)} ${f(cy)}Z`;
  return `${d}L${at(r0, a1)}A${f(r0)} ${f(r0)} 0 ${large} 0 ${at(r0, a0)}Z`;
}
