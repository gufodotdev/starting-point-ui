// Declared marks, axis parts and the cursor are templates, cloned per series, row or tick.

import { define } from "./define";
import type { SpInstance } from "./define";
import { INTERVALS, arcPath, intervalMs, linePath, linearTicks, roundedRect, tickFormat, timeTicks, toTime } from "./chart-math";
import type { Point } from "./chart-math";

const NS = "http://www.w3.org/2000/svg";
const MARKS = ["line", "area", "point", "bar", "pie", "label"] as const;

type Row = Record<string, unknown>;
type Dir = "x" | "y";

interface Layer {
  proto: SVGElement;
  host: SVGGElement;
  next: SVGGElement;
}

interface Mark {
  kind: (typeof MARKS)[number];
  layer: Layer;
  field: string;
  group: Element | null;
  stack: Element | null;
}

interface Axis {
  el: Element;
  dir: Dir;
  parts: Partial<Record<"grid" | "line" | "mark" | "tick", Layer>>;
}

interface Geometry {
  horizontal: boolean;
  pos: number[];
  step: number;
  box: [number, number, number, number];
}

interface Tick {
  pos: number;
  label: string;
}

const attr = (el: Element | null | undefined, name: string) => el?.getAttribute(`data-sp-${name}`) ?? null;
const num = (v: unknown) => (v === null || v === undefined || v === "" ? NaN : Number(v));
const svgEl = <T extends SVGElement>(tag: string) => document.createElementNS(NS, tag) as T;

function json<T>(text: string | null, fallback: T): T {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function format(value: unknown, options: string | null, lang?: string, auto?: Intl.DateTimeFormatOptions): string {
  const make = (key: string, fn: () => Intl.NumberFormat | Intl.DateTimeFormat) => {
    if (!formatters.has(key)) formatters.set(key, fn());
    return formatters.get(key)!;
  };
  const time = typeof value === "number" ? NaN : toTime(value);
  if (!isNaN(time) && (options || auto)) {
    const key = options ?? JSON.stringify(auto);
    return make(`d${lang}${key}`, () => new Intl.DateTimeFormat(lang, options ? json(options, {}) : auto)).format(time);
  }
  if (typeof value === "number" || (options && typeof value === "string" && !isNaN(num(value)))) {
    return make(`n${lang}${options}`, () => new Intl.NumberFormat(lang, json(options, {}))).format(Number(value));
  }
  return value === null || value === undefined ? "" : String(value);
}

const escape = (text: string) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function rowsOf(value: unknown): Row[] {
  return Array.isArray(value) ? value.map((r) => (r !== null && typeof r === "object" ? (r as Row) : { value: r })) : [];
}

function extent(values: number[]): [number, number] {
  let [lo, hi] = [Infinity, -Infinity];
  for (const v of values) if (isFinite(v)) [lo, hi] = [Math.min(lo, v), Math.max(hi, v)];
  return [lo, hi];
}

const generated = <T extends Element>(el: T) => (el.setAttribute("data-sp-clone", ""), el);

function take(proto: Element): Layer {
  const defs = generated(svgEl("defs"));
  const host = generated(svgEl<SVGGElement>("g"));
  proto.replaceWith(defs, host);
  defs.append(proto);
  return { proto: proto as SVGElement, host, next: host };
}

function make(layer: Layer, tag: string, attrs: Record<string, string | number> = {}): SVGElement {
  let el: SVGElement;
  if (layer.proto.localName === tag) {
    el = layer.proto.cloneNode(true) as SVGElement;
  } else {
    el = svgEl(tag);
    for (const a of layer.proto.attributes) el.setAttribute(a.name, a.value);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

const clone = (layer: Layer, tag: string, attrs?: Record<string, string | number>) => layer.next.appendChild(make(layer, tag, attrs));

function measure(svg: SVGSVGElement, layer: Layer | undefined, labels: string[]): { width: number; height: number } {
  if (!layer || !labels.length) return { width: 0, height: 0 };
  const longest = [...new Set(labels)].sort((a, b) => b.length - a.length).slice(0, 12);
  const texts = longest.map((label) => {
    const text = make(layer, "text") as SVGTextElement;
    text.textContent = label;
    return svg.appendChild(text);
  });
  let [width, height] = [0, 0];
  for (const text of texts) {
    const box = text.getBBox();
    [width, height] = [Math.max(width, box.width), Math.max(height, box.height)];
  }
  for (const text of texts) text.remove();
  return { width, height };
}

function gutter(svg: Element): number[] {
  const g = (attr(svg, "gutter") ?? "0").trim().split(/\s+/).map(Number);
  return [g[0], g[1] ?? g[0], g[2] ?? g[0], g[3] ?? g[1] ?? g[0]];
}

function side(axis: Axis, rtl: boolean): string {
  const s = attr(axis.el, "position") ?? (axis.dir === "x" ? "bottom" : "start");
  if (s === "start") return rtl ? "right" : "left";
  if (s === "end") return rtl ? "left" : "right";
  return s;
}

const width = (value: string | null, step: number) =>
  value === null ? step * 0.8 : value.endsWith("%") ? (parseFloat(value) / 100) * step : Number(value);

function index(sp: SpInstance) {
  const rows: Row[] = sp._rows;
  const axes: Axis[] = sp._axes;
  const lang: string | undefined = sp._lang;
  const horizontal = sp.el.hasAttribute("data-sp-horizontal");
  const iDir: Dir = horizontal ? "y" : "x";
  const iAxis = axes.find((a) => a.dir === iDir);
  const vAxis = axes.find((a) => a.dir !== iDir);
  const iField = attr(iAxis?.el, "field");
  const keys = rows.map((row, i) => (iField ? row[iField] : i));
  const scale = attr(iAxis?.el, "scale");
  const bars = (sp._marks as Mark[]).some((m) => m.kind === "bar");

  let continuous: number[] | null = null;
  if (!bars && rows.length > 1 && scale !== "categorical") {
    if (scale === "linear") continuous = keys.map(num);
    else if (scale === "time" || keys.every((k) => typeof k !== "number" && !isNaN(toTime(k)))) continuous = keys.map(toTime);
    if (continuous && !continuous.some(isFinite)) continuous = null;
  }
  const isTime = !!continuous && scale !== "linear";

  const vEl = vAxis?.el;
  const iFormat = attr(iAxis?.el, "format");
  const vLabel = (v: number) => `${attr(vEl, "tick-prefix") ?? ""}${format(v, attr(vEl, "format"), lang)}${attr(vEl, "tick-suffix") ?? ""}`;
  // Keeps a year key as 2021, not 2,021.
  const iLabel = (v: unknown, auto?: Intl.DateTimeFormatOptions) =>
    `${attr(iAxis?.el, "tick-prefix") ?? ""}${typeof v === "number" && !iFormat && !continuous ? String(v) : format(v, iFormat, lang, auto)}${attr(iAxis?.el, "tick-suffix") ?? ""}`;

  return { rows, axes, lang, horizontal, iDir, iAxis, vAxis, iField, keys, bars, continuous, isTime, vLabel, iLabel };
}

function table(sp: SpInstance): void {
  const el: HTMLTableElement | null = sp._table;
  if (!el || (sp._tableRows === sp._rows && sp._tableLang === sp._lang)) return;
  [sp._tableRows, sp._tableLang] = [sp._rows, sp._lang];
  const marks: Mark[] = sp._marks;
  const rows: Row[] = sp._rows;
  const lang: string | undefined = sp._lang;
  const name = (mark: Mark | undefined, fallback: string) => mark?.layer.proto.getAttribute("aria-label") ?? fallback;
  let head: string[];
  let cells: (row: Row, i: number) => string[];

  const pie = marks.find((m) => m.kind === "pie");
  if (pie) {
    const labelField = attr(pie.layer.proto, "label-field");
    head = [...(labelField ? [labelField] : []), name(pie, pie.field)];
    cells = (row) => [...(labelField ? [format(row[labelField], null, lang)] : []), format(row[pie.field], null, lang)];
  } else {
    const { iAxis, iField, keys, isTime, vLabel, iLabel } = index(sp);
    const fields = [...new Set(marks.map((m) => m.field))];
    const expanded = new Set(marks.filter((m) => attr(m.stack, "offset") === "expand").map((m) => m.field));
    const withTime = keys.some((k) => typeof k === "string" && k.includes("T"));
    const auto: Intl.DateTimeFormatOptions = { dateStyle: "medium", ...(withTime && { timeStyle: "short" }) };
    head = [iAxis?.el.getAttribute("aria-label") ?? iField ?? "#", ...fields.map((f) => name(marks.find((m) => m.field === f), f))];
    cells = (row, i) => [
      iField ? iLabel(keys[i], isTime ? auto : undefined) : String(i + 1),
      ...fields.map((f) => {
        const v = num(row[f]);
        return !isFinite(v) ? "" : expanded.has(f) ? format(v, null, lang) : vLabel(v);
      }),
    ];
  }
  const line = (tag: string, texts: string[]) => `<tr>${texts.map((t) => `<${tag}>${escape(t)}</${tag}>`).join("")}</tr>`;
  el.innerHTML = `<thead>${line("th", head)}</thead><tbody>${rows.map((row, i) => line("td", cells(row, i))).join("")}</tbody>`;
}

function render(sp: SpInstance): void {
  const svg: SVGSVGElement | null = sp._svg;
  sp._rtl = getComputedStyle(sp.el).direction === "rtl";
  sp._lang = attr(sp.el, "locale") ?? (sp.el.closest("[lang]")?.getAttribute("lang") || undefined);
  sp._byRow = [];
  sp._anchors = [];
  sp._order = [];
  sp._slices = new Map();
  sp._geometry = null;
  if (svg) {
    const layers: Layer[] = sp._layers;
    for (const layer of layers) layer.next = generated(svgEl<SVGGElement>("g"));
    const [w, h] = [svg.clientWidth, svg.clientHeight];
    if (w && h) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const marks: Mark[] = sp._marks;
      const pie = marks.find((m) => m.kind === "pie");
      if (pie && (marks.length > 1 || sp._axes.length || sp._cursor)) {
        console.warn("A chart pie can't share a chart with other marks, axes or a cursor.");
      } else if (pie) {
        renderPie(sp, pie, w, h);
      } else {
        renderCartesian(sp, w, h);
      }
    }
    for (const layer of layers) {
      layer.host.replaceWith(layer.next);
      layer.host = layer.next;
    }
    table(sp);
  }
  const active = sp._order.includes(sp._active) ? sp._active : null;
  sp._active = undefined;
  sp._show(active);
}

function renderPie(sp: SpInstance, mark: Mark, w: number, h: number): void {
  const [gt, gr, gb, gl] = gutter(sp._svg);
  const rows: Row[] = sp._rows;
  const proto = mark.layer.proto;
  const r1 = Math.max(0, Math.min(w - gl - gr, h - gt - gb) / 2);
  const inner = attr(proto, "inner-radius") ?? "0";
  const r0 = inner.endsWith("%") ? (parseFloat(inner) / 100) * r1 : Math.min(Number(inner) || 0, r1);
  const cx = gl + (w - gl - gr) / 2;
  const cy = gt + (h - gt - gb) / 2;

  const slices = rows.map((row, i) => ({ row, i, value: num(row[mark.field]) }));
  if (slices.some((s) => s.value < 0 || (!isNaN(s.value) && !isFinite(s.value)))) {
    console.warn("A chart pie leaves out negative and infinite values.");
  }
  const kept = slices.filter((s) => s.value > 0 && isFinite(s.value));
  const total = kept.reduce((sum, s) => sum + s.value, 0);
  let angle = 0;
  for (const { row, i, value } of kept) {
    const end = angle + (value / total) * Math.PI * 2;
    const el = clone(mark.layer, "path", { d: arcPath(cx, cy, r0, r1, angle, end) });
    el.style.setProperty("--sp-chart-color", typeof row.color === "string" ? row.color : `var(--chart-${(i % 5) + 1})`);
    const [middle, reach] = [(angle + end) / 2, (r0 + r1) / 2];
    sp._anchors[i] = [cx + reach * Math.sin(middle), cy - reach * Math.cos(middle)];
    sp._order.push(i);
    sp._byRow[i] = [el];
    sp._slices.set(el, i);
    angle = end;
  }
}

function renderCartesian(sp: SpInstance, w: number, h: number): void {
  const { rows, axes, horizontal, iDir, iAxis, vAxis, keys, bars, continuous, isTime, vLabel, iLabel } = index(sp);
  const svg: SVGSVGElement = sp._svg;
  const marks: Mark[] = sp._marks;
  const rtl: boolean = sp._rtl;
  const n = rows.length;
  if (!n) return;

  const spans = new Map<Mark, number[][]>();
  const stacks = new Map<Element, Mark[]>();
  for (const m of marks) {
    if (m.stack) stacks.set(m.stack, [...(stacks.get(m.stack) ?? []), m]);
    else spans.set(m, rows.map((row) => [0, num(row[m.field])]));
  }
  for (const [stack, members] of stacks) {
    const expand = attr(stack, "offset") === "expand";
    const fields = [...new Set(members.map((m) => m.field))];
    const layers = fields.map(() => [] as number[][]);
    rows.forEach((row, i) => {
      const values = fields.map((field) => num(row[field]) || 0);
      const total = expand ? values.reduce((sum, v) => sum + Math.abs(v), 0) || 1 : 1;
      let [up, down] = [0, 0];
      values.forEach((value, k) => {
        const v = value / total;
        const from = v >= 0 ? up : down;
        if (v >= 0) up += v;
        else down += v;
        layers[k][i] = [from, from + v];
      });
    });
    for (const m of members) spans.set(m, layers[fields.indexOf(m.field)]);
  }
  let [min, max] = extent([...spans.values()].flatMap((list) => list.map(([, to]) => to)));
  if (!isFinite(min)) [min, max] = [0, 1];

  const vEl = vAxis?.el;
  const fitted = !vAxis && !marks.some((m) => m.kind === "bar" || m.stack);
  const vTicks = (length: number) =>
    linearTicks(min, max, {
      count: num(attr(vEl, "tick-count")) || Math.max(2, Math.round(length / (horizontal ? 100 : 60))),
      start: fitted ? "min" : attr(vEl, "tick-start"),
      end: fitted ? "max" : attr(vEl, "tick-end"),
      values: json<number[] | null>(attr(vEl, "tick-values"), null),
    });

  const [gt, gr, gb, gl] = gutter(svg);
  const box = [gl, gt, w - gr, h - gb];
  const gap = 8;
  const reserve = (axis: Axis | undefined, size: { width: number; height: number }) => {
    if (!axis?.parts.tick || !size.width) return;
    const s = side(axis, rtl);
    if (s === "left") box[0] += size.width + gap;
    if (s === "right") box[2] -= size.width + gap;
    if (s === "top") box[1] += size.height + gap;
    if (s === "bottom") box[3] -= size.height + gap;
  };
  reserve(vAxis, measure(svg, vAxis?.parts.tick, vTicks(horizontal ? w : h).ticks.map(vLabel)));
  const iSize = measure(
    svg,
    iAxis?.parts.tick,
    continuous ? [iLabel(isTime ? new Date(extent(continuous)[0]) : extent(continuous)[0], isTime ? tickFormat(extent(continuous)[0]) : undefined)] : keys.map((k) => iLabel(k)),
  );
  reserve(iAxis, iSize);
  const labelText = (m: Mark, row: Row) => {
    const proto = m.layer.proto;
    const value = row[attr(proto, "label-field") ?? m.field];
    return `${attr(proto, "prefix") ?? ""}${format(value, attr(proto, "format"), sp._lang)}${attr(proto, "suffix") ?? ""}`;
  };
  for (const m of marks) {
    if (m.kind !== "label" || (attr(m.layer.proto, "position") ?? "end") !== "end") continue;
    const size = measure(svg, m.layer, rows.map((row) => labelText(m, row)));
    if (horizontal && rtl) box[0] += size.width + 10;
    else if (horizontal) box[2] -= size.width + 10;
    else box[1] += size.height + 8;
  }
  const [top, bottom] = [box[1], box[3]];
  let [left, right] = [box[0], box[2]];
  let pw = right - left;
  const ph = bottom - top;
  if (pw <= 0 || ph <= 0) return;

  const { domain, ticks } = vTicks(horizontal ? pw : ph);
  const [d0, d1] = domain;
  const clamp = (v: number) => Math.max(d0, Math.min(d1, v));
  const share = (v: number) => (v - d0) / (d1 - d0);
  const val = (v: number) => (horizontal ? (rtl ? right - share(v) * pw : left + share(v) * pw) : bottom - share(v) * ph);
  const base = val(clamp(0));

  let edges: string[] = [];
  let finest = Infinity;
  let endFormat: (t: number) => Intl.DateTimeFormatOptions = () => ({});
  if (continuous && isTime) {
    const [c0, c1] = extent(continuous);
    const sorted = continuous.filter(isFinite).sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) if (sorted[i] > sorted[i - 1]) finest = Math.min(finest, sorted[i] - sorted[i - 1]);
    // Slack for 23 hour DST days.
    const year = new Date(c0).getFullYear() !== new Date(c1).getFullYear() ? ({ year: "numeric" } as const) : {};
    const day = 864e5;
    endFormat = (t) =>
      finest < day * 0.9
        ? tickFormat(t, { year: !!year.year, date: c1 - c0 >= day })
        : finest < 27 * day
          ? { month: "short", day: "numeric", ...year }
          : finest < 360 * day
            ? { month: "short", ...year }
            : { year: "numeric" };
    edges = [c0, ...(c1 > c0 ? [c1] : [])].map((t) => iLabel(new Date(t), endFormat(t)));
  } else if (!continuous && n > 1) {
    edges = [iLabel(keys[0]), iLabel(keys[n - 1])];
  }
  let [inStart, inEnd] = [0, 0];
  const iCount = num(attr(iAxis?.el, "tick-count"));
  if (!horizontal && iAxis?.parts.tick && edges.length === 2 && iCount !== 2) {
    const [a, b] = edges.map((e) => measure(svg, iAxis.parts.tick, [e]).width / 2);
    for (let i = 0; i < 4; i++) {
      const slot = bars ? (pw - inStart - inEnd) / n / 2 : 0;
      inStart = Math.max(0, a - slot - (rtl ? w - right : left));
      inEnd = Math.max(0, b - slot - (rtl ? left : w - right));
    }
  }
  left += rtl ? inEnd : inStart;
  right -= rtl ? inStart : inEnd;
  pw = right - left;
  if (pw <= 0) return;
  const start = horizontal ? top : left;
  const length = horizontal ? ph : pw;
  const mirror = (p: number) => (rtl && !horizontal ? left + right - p : p);
  let step: number;
  let pos: number[];
  let [t0, t1] = [0, 1];
  // Whole days, so a 23 or 25 hour DST day keeps its width.
  const dates = isTime && keys.every((k) => typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k));
  const place = (t: number) => (dates ? t0 + Math.round((t - t0) / 864e5) * 864e5 : t);
  if (continuous) {
    [t0, t1] = extent(continuous);
    pos = continuous.map((t) => start + ((place(t) - t0) / (place(t1) - t0 || 1)) * length);
    step = length / (n - 1);
  } else if (bars) {
    step = length / n;
    pos = keys.map((_, i) => start + step * (i + 0.5));
  } else {
    step = n > 1 ? length / (n - 1) : length;
    pos = keys.map((_, i) => (n > 1 ? start + step * i : start + length / 2));
  }
  pos = pos.map(mirror);

  let iTicks: Tick[] = [];
  if (iAxis && iCount === 2 && n > 1) {
    iTicks = continuous
      ? [
          { pos: mirror(start), label: isTime ? edges[0] : iLabel(t0) },
          { pos: mirror(start + length), label: isTime ? edges[edges.length - 1] : iLabel(t1) },
        ]
      : [
          { pos: pos[0], label: iLabel(keys[0]) },
          { pos: pos[n - 1], label: iLabel(keys[n - 1]) },
        ];
  } else if (iAxis && continuous && isTime) {
    const span = place(t1) - t0 || 1;
    const along = (t: number) => ((place(t) - t0) / span) * length;
    const size = (texts: string[]) => measure(svg, iAxis.parts.tick, texts);
    const last = size(edges.slice(-1));
    const fromEnd = (rtl ? start : w - (start + length)) < last.width / 2 - 0.5 ? last.width : last.width / 2;
    const inside = (p: number, width: number) => horizontal || (p - width / 2 >= -0.5 && p + width / 2 <= w + 0.5);
    const layout = (interval: (typeof INTERVALS)[number]): { list: Tick[]; ok: boolean } => {
      const [unit, count] = interval;
      const ms = intervalMs(interval);
      const back = "smhdw".includes(unit) && timeTicks(t1, t1, [unit === "w" ? "d" : unit, 1]).length > 0;
      if (back) {
        const ticks: number[] = [];
        const d = new Date(t1);
        for (let i = 0; i < 1000 && d.getTime() >= t0 - 1; i++) {
          ticks.unshift(d.getTime());
          if (unit === "d" || unit === "w") d.setDate(d.getDate() - count * (unit === "w" ? 7 : 1));
          else d.setTime(d.getTime() - ms);
        }
        const labels = ticks.map((t, i) => iLabel(new Date(t), i === 0 || i === ticks.length - 1 ? endFormat(t) : tickFormat(t)));
        const middle = size(labels);
        const roomy = (ms / span) * length >= (horizontal ? middle.height + 4 : middle.width + 12);
        const list = ticks.flatMap((t, i) => {
          const p = mirror(start + along(t));
          return inside(p, i === 0 ? size([labels[0]]).width : middle.width) || i === ticks.length - 1 ? [{ pos: p, label: labels[i] }] : [];
        });
        return { list, ok: roomy };
      }
      const ticks = timeTicks(t0, t1, interval);
      const middle = size(ticks.map((t) => iLabel(new Date(t), tickFormat(t))));
      const context = { year: new Date(t0).getFullYear() !== new Date(t1).getFullYear(), date: false };
      const fits = (t: number) =>
        t1 - t >= ms * 0.75 &&
        inside(mirror(start + along(t)), t === t0 ? size([iLabel(new Date(t), tickFormat(t, context))]).width : middle.width) &&
        (horizontal ? length - along(t) >= middle.height + 4 : length - along(t) - middle.width / 2 >= fromEnd + 12);
      const kept = ticks.filter(fits);
      const roomy = (ms / span) * length >= (horizontal ? middle.height + 4 : middle.width + 12);
      const even = !kept.length || t1 - kept[kept.length - 1] < ms * 1.75;
      const list = [
        ...kept.map((t, i) => ({ pos: mirror(start + along(t)), label: iLabel(new Date(t), tickFormat(t, i === 0 ? context : undefined)) })),
        ...(t1 > t0 ? [{ pos: mirror(start + length), label: edges[edges.length - 1] }] : []),
      ];
      return { list, ok: roomy && even };
    };
    const usable = INTERVALS.filter((interval) => intervalMs(interval) >= finest * 0.99);
    const closest = iCount ? [...usable].sort((a, b) => Math.abs(span / intervalMs(a) - iCount) - Math.abs(span / intervalMs(b) - iCount))[0] : null;
    let chosen = layout(closest ?? INTERVALS[INTERVALS.length - 1]);
    if (!closest) {
      for (const interval of usable) {
        const candidate = layout(interval);
        if (candidate.ok) {
          chosen = candidate;
          break;
        }
      }
    }
    iTicks = chosen.list;
  } else if (iAxis && continuous) {
    iTicks = linearTicks(t0, t1, { count: iCount || 5, start: "min", end: "max" }).ticks.map((t) => ({
      pos: mirror(start + ((t - t0) / (t1 - t0 || 1)) * length),
      label: iLabel(t),
    }));
  } else if (iAxis) {
    const spacing = n > 1 ? (bars ? step : length / (n - 1)) : length;
    let every = iCount ? Math.ceil(n / iCount) : Math.max(1, Math.ceil((horizontal ? iSize.height + 4 : iSize.width + 12) / spacing));
    const pick = () => keys.map((_, i) => i).filter((i) => (n - 1 - i) % every === 0);
    const room = (i: number, end: boolean) => {
      const half = end ? measure(svg, iAxis.parts.tick, [iLabel(keys[i])]).width / 2 : iSize.width / 2;
      return pos[i] - half < -0.5 ? [pos[i], pos[i] + 2 * half] : pos[i] + half > w + 0.5 ? [pos[i] - 2 * half, pos[i]] : [pos[i] - half, pos[i] + half];
    };
    while (!horizontal && iAxis.parts.tick && every < n) {
      const list = pick();
      const spans = list.map((i, k) => room(i, k === 0 || k === list.length - 1)).sort((a, b) => a[0] - b[0]);
      if (spans.every((r, k) => !k || spans[k - 1][1] + 12 <= r[0] + 0.5)) break;
      every++;
    }
    const shown = pick();
    iTicks = shown.map((i) => ({ pos: pos[i], label: iLabel(keys[i]) }));
  }

  const at = (i: number, v: number): Point => [pos[i], val(v)];
  const xy = (a: number, b: number) => (horizontal ? { x: b, y: a } : { x: a, y: b });
  const peak: number[] = [];
  const reach = (i: number, c: number) => {
    if (peak[i] === undefined || Math.abs(c - base) > Math.abs(peak[i] - base)) peak[i] = c;
  };
  const segments = (span: number[][]) => {
    const runs: number[][] = [[]];
    span.forEach(([, to], i) => {
      if (isFinite(to) && isFinite(pos[i])) runs[runs.length - 1].push(i);
      else if (runs[runs.length - 1].length) runs.push([]);
    });
    return runs.filter((r) => r.length);
  };
  const bands = new Map<string, { offset: number; size: number }>();
  const groups = new Map<Element, Mark[]>();
  for (const m of marks) if (m.kind === "bar" && m.group) groups.set(m.group, [...(groups.get(m.group) ?? []), m]);
  const byRow: Element[][] = sp._byRow;
  const add = (i: number, el: Element) => (byRow[i] ??= []).push(el);

  for (const m of marks) {
    const smooth = attr(m.layer.proto, "curve") !== "none";
    const span = spans.get(m)!;
    if (m.kind === "line" || m.kind === "area") {
      const d = segments(span)
        .map((run) => {
          for (const i of run) reach(i, val(span[i][1]));
          const line = linePath(run.map((i) => at(i, span[i][1])), smooth, horizontal);
          if (m.kind === "line") return line;
          if (m.stack) return `${line}L${linePath(run.map((i) => at(i, span[i][0])).reverse(), smooth, horizontal).slice(1)}Z`;
          const [a, b] = [pos[run[run.length - 1]], pos[run[0]]];
          return horizontal ? `${line}L${base} ${a}L${base} ${b}Z` : `${line}L${a} ${base}L${b} ${base}Z`;
        })
        .join("");
      clone(m.layer, "path", { d });
    }
    if (m.kind === "point") {
      span.forEach(([, v], i) => {
        if (!isFinite(v) || !isFinite(pos[i])) return;
        reach(i, val(v));
        const { x, y } = xy(pos[i], val(v));
        const el = clone(m.layer, "circle", { cx: x, cy: y });
        if (!el.hasAttribute("r")) el.setAttribute("r", "3");
        add(i, el);
      });
    }
    if (m.kind === "bar") {
      const band = width(attr(m.group ?? m.stack ?? m.layer.proto, "width"), step);
      let offset = -band / 2;
      let size = band;
      if (m.group) {
        const members = groups.get(m.group)!;
        const k = members.length;
        const space = k > 1 ? Math.min(4, band / k / 4) : 0;
        size = (band - space * (k - 1)) / k;
        offset += members.indexOf(m) * (size + space);
      }
      if (rtl && !horizontal) offset = -offset - size;
      bands.set(m.field, { offset, size });
      const radius = (attr(m.layer.proto, "radius") ?? (m.stack ? "0" : "4")).trim().split(/\s+/).map(Number);
      const [end, root] = [radius[0] || 0, radius[1] ?? radius[0] ?? 0];
      span.forEach(([from, to], i) => {
        if (!isFinite(to)) return;
        const [a, b] = [val(clamp(from)), val(clamp(to))];
        reach(i, b);
        const lo = Math.min(a, b);
        const length = Math.abs(b - a);
        const d = horizontal
          ? roundedRect(lo, pos[i] + offset, length, size, b >= a ? [root, end, end, root] : [end, root, root, end])
          : roundedRect(pos[i] + offset, lo, size, length, to >= from ? [end, end, root, root] : [root, root, end, end]);
        add(i, clone(m.layer, "path", { d }));
      });
    }
    if (m.kind === "label") {
      const position = attr(m.layer.proto, "position") ?? "end";
      const band = bands.get(m.field);
      const across = band ? band.offset + band.size / 2 : 0;
      span.forEach(([from, to], i) => {
        if (!isFinite(to) || !isFinite(pos[i])) return;
        const outward = (horizontal ? (rtl ? -1 : 1) : -1) * (to >= from ? 1 : -1);
        const toward = position === "inside-end" ? -outward : outward;
        const at = position === "inside-start" ? val(clamp(from)) + outward * 8 : val(clamp(to)) + (position === "end" ? outward * 10 : -outward * 8);
        const el = clone(m.layer, "text", horizontal ? { x: at, y: pos[i] + across } : { x: pos[i] + across, y: at });
        el.textContent = labelText(m, rows[i]);
        const defaults: Record<string, string> = horizontal
          ? { "text-anchor": (toward > 0) !== rtl ? "start" : "end", "dominant-baseline": "middle" }
          : { "text-anchor": "middle", "dominant-baseline": toward < 0 ? "auto" : "hanging" };
        for (const [k, v] of Object.entries(defaults)) if (!el.hasAttribute(k)) el.setAttribute(k, v);
        add(i, el);
      });
    }
  }
  rows.forEach((_, i) => {
    if (!isFinite(pos[i])) return;
    const c = peak[i] ?? (horizontal ? (left + right) / 2 : (top + bottom) / 2);
    sp._anchors[i] = horizontal ? [c, pos[i]] : [pos[i], c];
    sp._order.push(i);
  });

  const vTickList = ticks.map((v) => ({ pos: val(v), label: vLabel(v) }));
  const anchor = (align: "left" | "right") => ((align === "left") !== rtl ? "start" : "end");
  for (const axis of axes) {
    const list = axis.dir === iDir ? iTicks : vTickList;
    const s = side(axis, rtl);
    const { grid, line, mark, tick } = axis.parts;
    const edge = s === "top" ? top : s === "bottom" ? bottom : s === "left" ? left : right;
    const out = s === "top" || s === "left" ? -1 : 1;
    const endsOnly = axis.dir === iDir && iCount === 2;
    const halves = axis.dir === "x" && tick && list.length ? [list[0], list[list.length - 1]].map((t) => measure(svg, tick, [t.label]).width / 2) : [0, 0];
    for (const t of list) {
      if (grid) clone(grid, "line", axis.dir === "x" ? { x1: t.pos, x2: t.pos, y1: top, y2: bottom } : { x1: left, x2: right, y1: t.pos, y2: t.pos });
      if (mark) clone(mark, "line", axis.dir === "x" ? { x1: t.pos, x2: t.pos, y1: edge, y2: edge + 6 * out } : { x1: edge, x2: edge + 6 * out, y1: t.pos, y2: t.pos });
      if (tick) {
        const el = clone(tick, "text", axis.dir === "x" ? { x: t.pos, y: edge + gap * out } : { x: edge + gap * out, y: t.pos });
        el.textContent = t.label;
        const [first, last] = rtl ? [halves[1], halves[0]] : halves;
        const atEnd = t === list[0] || t === list[list.length - 1];
        const align =
          endsOnly && atEnd
            ? anchor(t.pos < (left + right) / 2 ? "left" : "right")
            : atEnd && t.pos < first - 0.5
              ? anchor("left")
              : atEnd && w - t.pos < last - 0.5
                ? anchor("right")
                : "middle";
        const defaults: Record<string, string> =
          axis.dir === "x"
            ? { "text-anchor": align, "dominant-baseline": s === "top" ? "auto" : "hanging" }
            : { "text-anchor": anchor(s === "left" ? "right" : "left"), "dominant-baseline": "middle" };
        for (const [k, v] of Object.entries(defaults)) if (!el.hasAttribute(k)) el.setAttribute(k, v);
      }
    }
    if (line) clone(line, "line", axis.dir === "x" ? { x1: left, x2: right, y1: edge, y2: edge } : { x1: edge, x2: edge, y1: top, y2: bottom });
  }
  if (sp._zero && d0 < 0 && d1 > 0) {
    clone(sp._zero, "line", horizontal ? { x1: base, x2: base, y1: top, y2: bottom } : { x1: left, x2: right, y1: base, y2: base });
  }

  sp._geometry = { horizontal, pos, step, box: [left, top, right, bottom] } as Geometry;
}

const charts = new Set<SpInstance>();
const locale =
  typeof MutationObserver === "undefined"
    ? null
    : new MutationObserver((records) => {
        for (const chart of charts) if (records.some((r) => r.target.contains(chart.el))) chart._redraw();
      });

export const Chart = define({
  name: "chart",
  selector: ".chart",

  methods: {
    setValue(this: SpInstance, value: unknown) {
      this._rows = rowsOf(value);
      render(this);
    },

    setActive(this: SpInstance, index: number | null) {
      const i = index === null || !this._order.includes(index) ? null : index;
      const anchor: Point | undefined = i === null ? undefined : this._anchors[i];
      const rect = this._svg?.getBoundingClientRect();
      this._show(i, anchor && rect ? { clientX: rect.left + anchor[0], clientY: rect.top + anchor[1] } : undefined);
    },

    _show(this: SpInstance, index: number | null, pointer?: { clientX: number; clientY: number }) {
      if (index !== this._active) {
        const previous: number | null | undefined = this._active;
        this._active = index;
        const byRow: Element[][] = this._byRow;
        const mark = (i: number) => {
          for (const el of byRow[i] ?? []) {
            el.toggleAttribute("data-active", i === index);
            el.toggleAttribute("data-inactive", index !== null && i !== index);
          }
        };
        if (previous === null || previous === undefined || index === null) byRow.forEach((_, i) => mark(i));
        else [previous, index].forEach(mark);

        const g: Geometry | null = this._geometry;
        const cursor: Layer | null = this._cursor;
        if (cursor) {
          cursor.host.replaceChildren();
          if (index !== null && g) {
            const [left, top, right, bottom] = g.box;
            const p = g.pos[index];
            const half = g.step / 2;
            if (attr(cursor.proto, "type") === "area") {
              clone(cursor, "rect", g.horizontal ? { x: left, y: p - half, width: right - left, height: g.step } : { x: p - half, y: top, width: g.step, height: bottom - top });
            } else {
              clone(cursor, "line", g.horizontal ? { x1: left, x2: right, y1: p, y2: p } : { x1: p, x2: p, y1: top, y2: bottom });
            }
          }
        }

        const rows: Row[] = this._rows;
        for (const el of this.el.querySelectorAll<HTMLElement>(".chart-value")) {
          const fallback = attr(el, "fallback");
          const row = index !== null ? rows[index] : fallback === null ? rows[rows.length - 1] : null;
          el.textContent = row
            ? `${attr(el, "prefix") ?? ""}${format(row[attr(el, "field") ?? "value"], attr(el, "format"), this._lang)}${attr(el, "suffix") ?? ""}`
            : (fallback ?? "");
        }

        const color = index !== null ? (byRow[index]?.[0] as SVGElement | undefined)?.style.getPropertyValue("--sp-chart-color") : "";
        if (color) this.el.style.setProperty("--sp-chart-color", color);
        else this.el.style.removeProperty("--sp-chart-color");
      }

      for (const tooltip of this.el.querySelectorAll<HTMLElement>(".chart-tooltip")) {
        tooltip.classList.toggle("shown", index !== null);
        if (index === null || !pointer) continue;
        const parent = (tooltip.offsetParent as HTMLElement | null) ?? this.el;
        const box = parent.getBoundingClientRect();
        const [x, y] = [pointer.clientX - box.left, pointer.clientY - box.top];
        const [tw, th] = [tooltip.offsetWidth, tooltip.offsetHeight];
        const offset = 16;
        const [before, after] = [x - offset - tw, x + offset];
        const left = this._rtl ? (before >= 0 ? before : after) : after + tw <= box.width ? after : before;
        const top = y + offset + th > box.height ? y - offset - th : y + offset;
        tooltip.style.left = `${Math.max(0, left)}px`;
        tooltip.style.top = `${Math.max(0, top)}px`;
      }
    },
  },

  init(this: SpInstance) {
    // Resets a copy of a drawn chart, like a page cache snapshot.
    for (const el of this.el.querySelectorAll("[data-sp-clone]")) {
      if (el.localName === "defs") el.replaceWith(...el.childNodes);
      else el.remove();
    }

    const svg = this.el.querySelector<SVGSVGElement>(".chart-svg");
    this._svg = svg;
    this._rows = rowsOf(json(this.el.getAttribute("data-sp-value"), []));
    this._active = undefined;
    this._byRow = [];
    this._anchors = [];
    this._order = [];
    this._slices = new Map();
    this._marks = [];
    this._axes = [];
    this._layers = [];
    this._cursor = null;
    this._zero = null;
    this._added = [];
    this._table = null;
    this._live = null;

    let frame = 0;
    this._redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => render(this));
    };
    this._cancel = () => cancelAnimationFrame(frame);
    const data = new MutationObserver((records) => {
      if (records.some((r) => r.attributeName === "data-sp-value")) this._rows = rowsOf(json(this.el.getAttribute("data-sp-value"), []));
      this._redraw();
    });
    data.observe(this.el, { attributes: true, attributeFilter: ["data-sp-value", "data-sp-horizontal", "data-sp-locale"] });
    this._observers = [data];
    if (!svg) return;

    const track = (layer: Layer) => (this._layers.push(layer), layer);
    for (const el of svg.querySelectorAll(MARKS.map((k) => `.chart-${k}`).join(","))) {
      const kind = MARKS.find((k) => el.classList.contains(`chart-${k}`))!;
      const [group, stack] = [el.closest(".chart-group"), el.closest(".chart-stack")];
      this._marks.push({ kind, layer: track(take(el)), field: attr(el, "field") ?? "value", group, stack });
    }
    for (const el of svg.querySelectorAll(".chart-axis")) {
      const axis: Axis = { el, dir: attr(el, "axis") === "y" ? "y" : "x", parts: {} };
      for (const part of ["grid", "line", "mark", "tick"] as const) {
        const proto = el.querySelector(`.chart-axis-${part}`);
        if (proto) axis.parts[part] = track(take(proto));
      }
      this._axes.push(axis);
    }
    const cursor = svg.querySelector(".chart-cursor");
    if (cursor) this._cursor = track(take(cursor));
    svg.prepend(...this._axes.map((a: Axis) => a.el), ...(this._cursor ? [this._cursor.host] : []));
    const zero = svg.querySelector(".chart-zero-line");
    if (zero) this._zero = track(take(zero));

    const set = (name: string, value: string) => {
      if (svg.hasAttribute(name)) return;
      svg.setAttribute(name, value);
      this._added.push(name);
    };
    const named = svg.hasAttribute("aria-label") || svg.hasAttribute("aria-labelledby");
    const interactive = !!(this._cursor || this.el.querySelector(".chart-tooltip, .chart-value"));
    if (!named) set("aria-hidden", "true");
    if (named && svg.getAttribute("aria-hidden") !== "true") {
      set("role", "img");
      this._table = generated(document.createElement("table"));
      this._table.className = "sr-only";
      this._table.setAttribute("aria-label", svg.getAttribute("aria-label") ?? "");
      if (svg.hasAttribute("aria-labelledby")) this._table.setAttribute("aria-labelledby", svg.getAttribute("aria-labelledby")!);
      this.el.append(this._table);
      if (interactive) {
        set("tabindex", "0");
        this._live = generated(document.createElement("div"));
        this._live.className = "sr-only";
        this._live.setAttribute("aria-live", "polite");
        this.el.append(this._live);
      }
    }

    // The first resize callback does the initial draw.
    const resize = new ResizeObserver(() => {
      this._cancel();
      render(this);
    });
    resize.observe(svg);
    this._observers.push(resize);
    charts.add(this);
    locale?.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["dir", "lang"] });
    if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(() => charts.has(this) && this._redraw());

    const hover = (e: PointerEvent) => {
      if (this._slices.size) {
        this._show(this._slices.get(e.target as Element) ?? null, e);
        return;
      }
      const g: Geometry | null = this._geometry;
      if (!g) return;
      const rect = svg.getBoundingClientRect();
      const c = g.horizontal ? e.clientY - rect.top : e.clientX - rect.left;
      let best = -1;
      g.pos.forEach((p, i) => {
        if (isFinite(p) && (best < 0 || Math.abs(p - c) < Math.abs(g.pos[best] - c))) best = i;
      });
      if (best >= 0) this._show(best, e);
    };
    this.on(svg, "pointermove", hover as (e: Event) => void);
    this.on(svg, "pointerdown", hover as (e: Event) => void);
    // Touch leaves on lift, so a tap keeps its row.
    this.on(svg, "pointerleave", (e) => {
      if ((e as PointerEvent).pointerType !== "touch") this._show(null);
    });
    this.on(document, "pointerdown", (e) => {
      if (this._active !== null && !this.el.contains(e.target as Node)) this._show(null);
    });
    if (!this._live) return;

    this.on(svg, "keydown", (e: Event) => {
      const { key } = e as KeyboardEvent;
      const order: number[] = this._order;
      if (!order.length) return;
      const [next, prev] = this._rtl ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];
      const horizontal = this._geometry?.horizontal;
      const forward = horizontal ? ["ArrowDown"] : this._slices.size ? [next, "ArrowDown"] : [next];
      const back = horizontal ? ["ArrowUp"] : this._slices.size ? [prev, "ArrowUp"] : [prev];
      const at = order.indexOf(this._active);
      let target: number | null;
      if (forward.includes(key)) target = at < 0 ? 0 : Math.min(at + 1, order.length - 1);
      else if (back.includes(key)) target = at < 0 ? order.length - 1 : Math.max(at - 1, 0);
      else if (key === "Home") target = 0;
      else if (key === "End") target = order.length - 1;
      else if (key === "Escape" && this._active !== null) target = null;
      else return;
      e.preventDefault();
      e.stopPropagation();
      if (target === null) {
        this._show(null);
        return;
      }
      const row = order[target];
      this.setActive(row);
      const source = this.el.querySelector(".chart-tooltip") ?? this._table?.tBodies[0]?.rows[row];
      const words: string[] = [];
      if (source) {
        const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) words.push(walker.currentNode.textContent ?? "");
      }
      this._live.textContent = words.join(" ").replace(/\s+/g, " ").trim();
    });
    this.on(svg, "blur", () => this._show(null));
  },

  ready(this: SpInstance) {
    if (!this._svg) this._show(null);
  },

  destroy(this: SpInstance) {
    this._cancel();
    for (const observer of this._observers) observer.disconnect();
    charts.delete(this);
    for (const layer of this._layers as Layer[]) {
      layer.proto.parentElement?.replaceWith(layer.proto);
      layer.host.remove();
    }
    this._table?.remove();
    this._live?.remove();
    for (const name of this._added) this._svg?.removeAttribute(name);
    this.el.style.removeProperty("--sp-chart-color");
  },
});
