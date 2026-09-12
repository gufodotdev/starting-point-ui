// Month grid bound to native date inputs. The inputs are the state: one
// input selects a single date, two select a range, one with `multiple`
// collects several dates as hidden same-name inputs. Values are ISO dates,
// exactly what a native date input submits.

import { define } from "./define";
import type { SpInstance } from "./define";

const DAY = 86_400_000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIso(s: string | null | undefined): Date | null {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return toIso(d) === s ? d : null;
}

function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - yearStart) / DAY + 1) / 7);
}

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// A date, a `from..to` range, or a weekday name, comma-separated.
function parseDisabled(spec: string): (d: Date) => boolean {
  const rules: Array<(d: Date) => boolean> = [];
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const weekday = WEEKDAYS.indexOf(part.slice(0, 3).toLowerCase());
    const range = part.split("..");
    if (weekday >= 0 && !/\d/.test(part)) rules.push((d) => d.getDay() === weekday);
    else if (range.length === 2) rules.push((d) => toIso(d) >= range[0] && toIso(d) <= range[1]);
    else rules.push((d) => toIso(d) === part);
  }
  return (d) => rules.some((rule) => rule(d));
}

function resolveBound(value: string | undefined): string | null {
  if (!value) return null;
  return value === "today" ? toIso(today()) : value;
}

const svg = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const CHEVRON_LEFT = svg('<path d="m15 18-6-6 6-6"/>');
const CHEVRON_RIGHT = svg('<path d="m9 18 6-6-6-6"/>');
const CHEVRON_DOWN = svg('<path d="m6 9 6 6 6-6"/>');

type Mode = "single" | "range" | "multiple";

export const Calendar = define({
  name: "calendar",
  selector: ".calendar",

  props: {
    month: String,
    months: { type: Number, default: 1 },
    caption: { type: String, default: "label" },
    weekNumbers: { type: Boolean, default: false },
    weekStart: { type: Number, default: 0 },
    locale: String,
    min: String,
    max: String,
    disabled: String,
  },

  init(this: SpInstance) {
    this._inputs = [...this.el.querySelectorAll<HTMLInputElement>(':scope > input[type="date"]')];
    const first = this._inputs[0] as HTMLInputElement | undefined;
    this._mode = (
      first?.multiple ? "multiple" : this._inputs.length >= 2 ? "range" : "single"
    ) as Mode;
    if (this._mode === "multiple" && first) {
      // The template never submits and only validates while nothing is picked;
      // each picked date is its own hidden input under the template's name.
      this._name = first.name;
      this._required = first.required;
      first.removeAttribute("name");
      const authored = [...this.el.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${CSS.escape(this._name as string)}"]`)];
      this._authored = authored.map((c) => c.value);
      this._setClones(this._authored as string[]);
    }
    this._locale = (this.config.locale as string) || document.documentElement.lang || undefined;
    this._isDisabled = parseDisabled((this.config.disabled as string) ?? "");
    this._min = resolveBound(this.config.min as string | undefined);
    this._max = resolveBound(this.config.max as string | undefined);
    for (const input of this._inputs) {
      if (this._min && !input.min) input.min = this._min;
      if (this._max && !input.max) input.max = this._max;
    }

    const startIso = (this.config.month as string | undefined) ?? (this._anchorDate() ?? toIso(today())).slice(0, 7);
    this._month = parseIso(`${startIso}-01`) ?? addMonths(today(), 0);
    this._focus = this._anchorDate() ?? toIso(today());
    this._hover = null;

    this._body = document.createElement("div");
    this._body.className = "calendar-months";
    this.el.appendChild(this._body);

    this.on(this._body, "click", (e) => this._onClick(e as MouseEvent));
    this.on(this._body, "keydown", (e) => this._onKeydown(e as KeyboardEvent));
    this.on(this._body, "change", (e) => this._onSelectChange(e));
    this.on(this._body, "pointerover", (e) => {
      const day = (e.target as HTMLElement).closest<HTMLElement>(".calendar-day");
      const iso = day?.dataset.date ?? null;
      if (this._mode === "range" && iso !== this._hover) {
        this._hover = iso;
        this._paint();
      }
    });
    this.on(this._body, "pointerleave", () => {
      if (this._hover) {
        this._hover = null;
        this._paint();
      }
    });

    // Value changes made by scripts (or a form reset) re-render from the inputs.
    this.on(this.el, "change", (e) => {
      if (this._writing || !(e.target as HTMLElement).matches?.("input")) return;
      const iso = this._anchorDate();
      if (iso) this.goTo(iso.slice(0, 7));
      this._render();
    });
    const form = first?.form;
    if (form) {
      this.on(form, "reset", () => {
        setTimeout(() => {
          if (this._mode === "multiple") this._setClones(this._authored as string[]);
          const iso = this._anchorDate();
          if (iso) this.goTo(iso.slice(0, 7));
          this._render();
        });
      });
    }

    this._render();
  },

  destroy(this: SpInstance) {
    (this._body as HTMLElement | undefined)?.remove();
    const first = (this._inputs as HTMLInputElement[])[0];
    if (this._mode === "multiple" && first) first.name = this._name as string;
  },

  methods: {
    // The date the view should open on: the selection, or its start.
    _anchorDate(this: SpInstance): string | null {
      const values = this._values() as string[];
      return values[0] ?? null;
    },

    _clones(this: SpInstance): HTMLInputElement[] {
      const name = CSS.escape((this._name as string) ?? "");
      return [...this.el.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)];
    },

    _setClones(this: SpInstance, values: string[]): void {
      const template = (this._inputs as HTMLInputElement[])[0];
      (this._clones() as HTMLInputElement[]).forEach((c) => c.remove());
      let after: Element = template;
      for (const iso of values) {
        const clone = document.createElement("input");
        clone.type = "hidden";
        clone.name = this._name as string;
        clone.value = iso;
        after.insertAdjacentElement("afterend", clone);
        after = clone;
      }
      template.required = (this._required as boolean) && values.length === 0;
    },

    _values(this: SpInstance): string[] {
      const inputs = this._inputs as HTMLInputElement[];
      if (this._mode === "multiple") return (this._clones() as HTMLInputElement[]).map((c) => c.value).sort();
      return inputs.map((i) => i.value).filter((v) => parseIso(v));
    },

    value(this: SpInstance): string | string[] | { from: string; to: string } {
      const inputs = this._inputs as HTMLInputElement[];
      if (this._mode === "multiple") return this._values();
      if (this._mode === "range") return { from: inputs[0]?.value ?? "", to: inputs[1]?.value ?? "" };
      return inputs[0]?.value ?? "";
    },

    _write(this: SpInstance, next: Record<number, string> | string[]): void {
      const inputs = this._inputs as HTMLInputElement[];
      this._writing = true;
      try {
        if (Array.isArray(next)) {
          const template = inputs[0];
          this._setClones(next);
          template.dispatchEvent(new Event("input", { bubbles: true }));
          template.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          for (const [index, iso] of Object.entries(next)) {
            const input = inputs[Number(index)];
            if (!input || input.value === iso) continue;
            input.value = iso;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      } finally {
        this._writing = false;
      }
      this._render();
      this.emit("change", this._detail());
    },

    _detail(this: SpInstance): unknown {
      if (this._mode === "multiple") return { values: this._values() };
      if (this._mode === "range") return this.value();
      return { value: this.value() };
    },

    select(this: SpInstance, value: string | string[] | { from: string; to?: string }): void {
      if (this._mode === "multiple") {
        const list = Array.isArray(value) ? value : [value as string];
        this._write([...new Set(list.filter((v) => parseIso(v)))].sort());
      } else if (this._mode === "range") {
        const range = typeof value === "string" ? { from: value, to: "" } : (value as { from: string; to?: string });
        const [from, to] = [range.from ?? "", range.to ?? ""].sort((a, b) => (a && b ? a.localeCompare(b) : 0));
        this._write({ 0: from, 1: to });
      } else {
        this._write({ 0: value as string });
      }
      const iso = this._anchorDate();
      if (iso) this.goTo(iso.slice(0, 7));
    },

    clear(this: SpInstance): void {
      if (this._mode === "multiple") this._write([]);
      else this._write({ 0: "", 1: "" });
    },

    // Show the month holding `YYYY-MM` (or an ISO date).
    goTo(this: SpInstance, month: string): void {
      const d = parseIso(`${month.slice(0, 7)}-01`);
      if (!d) return;
      const count = this.config.months as number;
      const last = addMonths(this._month as Date, count - 1);
      if (d >= (this._month as Date) && d <= last) return;
      this._month = d;
      this._render();
    },

    _pick(this: SpInstance, iso: string): void {
      const inputs = this._inputs as HTMLInputElement[];
      if (!inputs.length) return;
      if (this._mode === "multiple") {
        const values = this._values() as string[];
        this._write(values.includes(iso) ? values.filter((v) => v !== iso) : [...values, iso].sort());
        return;
      }
      if (this._mode === "range") {
        const from = parseIso(inputs[0].value) ? inputs[0].value : "";
        const to = parseIso(inputs[1].value) ? inputs[1].value : "";
        // A pick on a complete range starts a new one: which edge a pick
        // inside it should move is ambiguous, so it doesn't guess.
        if (!from || to) this._write({ 0: iso, 1: "" });
        else this._write(iso < from ? { 0: iso, 1: from } : { 0: from, 1: iso });
        return;
      }
      // A second click on the picked day clears an optional field.
      this._write({ 0: inputs[0].value === iso && !inputs[0].required ? "" : iso });
    },

    _dayDisabled(this: SpInstance, d: Date): boolean {
      const iso = toIso(d);
      if (this._min && iso < this._min) return true;
      if (this._max && iso > this._max) return true;
      return this._isDisabled(d);
    },

    _fmt(this: SpInstance, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
      return new Intl.DateTimeFormat(this._locale as string | undefined, opts);
    },

    _render(this: SpInstance): void {
      const body = this._body as HTMLElement;
      const count = this.config.months as number;
      const hadFocus = body.contains(document.activeElement);
      const values = this._values() as string[];
      const selected = new Set(values);
      const from = this._mode === "range" ? (this._inputs[0] as HTMLInputElement).value : "";
      const to = this._mode === "range" ? (this._inputs[1] as HTMLInputElement).value : "";
      const todayIso = toIso(today());
      const weekStart = this.config.weekStart as number;
      const weekdays = this._weekdays(weekStart);
      const captionFmt = this._fmt({ month: "long", year: "numeric" });
      const dayFmt = this._fmt({ dateStyle: "long" });

      const months: string[] = [];
      for (let i = 0; i < count; i++) {
        const month = addMonths(this._month as Date, i);
        const firstOffset = (month.getDay() - weekStart + 7) % 7;
        const start = addDays(month, -firstOffset);
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const weeks = Math.ceil((firstOffset + daysInMonth) / 7);
        const rows: string[] = [];
        for (let w = 0; w < weeks; w++) {
          const cells: string[] = [];
          if (this.config.weekNumbers) {
            cells.push(`<td class="calendar-week-number">${isoWeek(addDays(start, w * 7))}</td>`);
          }
          for (let c = 0; c < 7; c++) {
            const d = addDays(start, w * 7 + c);
            const iso = toIso(d);
            const classes = ["calendar-cell"];
            const inRange = from && to && iso > from && iso < to;
            const preview = from && !to && this._hover && ((iso > from && iso <= this._hover) || (iso < from && iso >= this._hover));
            if (d.getMonth() !== month.getMonth()) classes.push("outside");
            if (iso === todayIso) classes.push("today");
            if (this._dayDisabled(d)) classes.push("disabled");
            if (selected.has(iso)) classes.push("selected");
            if (from && iso === from && to) classes.push(from === to ? "range-start range-end" : "range-start");
            if (to && iso === to && from !== to) classes.push("range-end");
            if (inRange || preview) classes.push("range-middle");
            const cellClass = classes.join(" ");
            const dayClass = cellClass.replace("calendar-cell", "calendar-day");
            cells.push(
              `<td class="${cellClass}" role="gridcell" aria-selected="${selected.has(iso)}"><button type="button" class="${dayClass}" data-date="${iso}" tabindex="${iso === this._focus ? 0 : -1}" aria-label="${dayFmt.format(d)}" aria-selected="${selected.has(iso)}"${this._dayDisabled(d) ? " disabled" : ""}>${d.getDate()}</button></td>`,
            );
          }
          rows.push(`<tr class="calendar-week">${cells.join("")}</tr>`);
        }
        const numberHead = this.config.weekNumbers ? `<th class="calendar-week-number-header"></th>` : "";
        months.push(`<div class="calendar-month">
  <div class="calendar-caption">${this._caption(month, captionFmt)}</div>
  <table class="calendar-grid" role="grid" aria-label="${captionFmt.format(month)}">
    <thead><tr class="calendar-weekdays">${numberHead}${weekdays}</tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>
</div>`);
      }

      const prevDisabled = this._min ? toIso(addDays(this._month as Date, -1)) < this._min : false;
      const lastVisible = addMonths(this._month as Date, count);
      const nextDisabled = this._max ? toIso(lastVisible) > this._max : false;
      body.innerHTML = `<div class="calendar-nav">
  <button type="button" class="calendar-previous" aria-label="Previous month"${prevDisabled ? " disabled" : ""}>${CHEVRON_LEFT}</button>
  <button type="button" class="calendar-next" aria-label="Next month"${nextDisabled ? " disabled" : ""}>${CHEVRON_RIGHT}</button>
</div>${months.join("")}`;

      // Keep exactly one day tabbable; the focus target may have scrolled out of view.
      if (!body.querySelector('.calendar-day[tabindex="0"]')) {
        const fallback =
          body.querySelector<HTMLElement>(`.calendar-day.selected`) ??
          body.querySelector<HTMLElement>(`.calendar-day.today`) ??
          body.querySelector<HTMLElement>(`.calendar-day:not(.outside):not([disabled])`);
        if (fallback) {
          fallback.tabIndex = 0;
          this._focus = fallback.dataset.date;
        }
      }
      if (hadFocus) body.querySelector<HTMLElement>(`.calendar-day[data-date="${this._focus}"]`)?.focus();
    },

    // Two-letter abbreviations where they stay distinct ("Su Mo"), otherwise
    // the locale's narrow names, since e.g. Arabic short names share a prefix.
    _weekdays(this: SpInstance, weekStart: number): string {
      const days = Array.from({ length: 7 }, (_, c) => addDays(new Date(2024, 0, 7 + weekStart), c));
      const short = days.map((d) => this._fmt({ weekday: "short" }).format(d).slice(0, 2));
      const names = new Set(short).size === 7 ? short : days.map((d) => this._fmt({ weekday: "narrow" }).format(d));
      return names.map((name) => `<th class="calendar-weekday" scope="col">${name}</th>`).join("");
    },

    _caption(this: SpInstance, month: Date, captionFmt: Intl.DateTimeFormat): string {
      if (this.config.caption !== "dropdown") {
        return `<span class="calendar-caption-label">${captionFmt.format(month)}</span>`;
      }
      const monthFmt = this._fmt({ month: "short" });
      const yearNow = today().getFullYear();
      const minYear = this._min ? Number(this._min.slice(0, 4)) : yearNow - 100;
      const maxYear = this._max ? Number(this._max.slice(0, 4)) : yearNow + 10;
      const monthOptions = Array.from({ length: 12 }, (_, m) => {
        const d = new Date(month.getFullYear(), m, 1);
        return `<option value="${m}"${m === month.getMonth() ? " selected" : ""}>${monthFmt.format(d)}</option>`;
      });
      const yearOptions: string[] = [];
      for (let y = minYear; y <= maxYear; y++) {
        yearOptions.push(`<option value="${y}"${y === month.getFullYear() ? " selected" : ""}>${y}</option>`);
      }
      return `<div class="calendar-dropdowns">
  <label class="calendar-dropdown"><span class="calendar-dropdown-label">${monthFmt.format(month)}${CHEVRON_DOWN}</span><select class="calendar-month-select" aria-label="Month">${monthOptions.join("")}</select></label>
  <label class="calendar-dropdown"><span class="calendar-dropdown-label">${month.getFullYear()}${CHEVRON_DOWN}</span><select class="calendar-year-select" aria-label="Year">${yearOptions.join("")}</select></label>
</div>`;
    },

    // Range hover preview without a full re-render.
    _paint(this: SpInstance): void {
      const body = this._body as HTMLElement;
      const from = (this._inputs[0] as HTMLInputElement).value;
      const to = (this._inputs[1] as HTMLInputElement).value;
      if (!parseIso(from) || parseIso(to)) return;
      const hover = this._hover as string | null;
      body.querySelectorAll<HTMLElement>(".calendar-cell").forEach((cell) => {
        const day = cell.firstElementChild as HTMLElement;
        const iso = day.dataset.date as string;
        const on = !!hover && ((iso > from && iso <= hover) || (iso < from && iso >= hover));
        cell.classList.toggle("range-middle", on);
        day.classList.toggle("range-middle", on);
      });
    },

    _onClick(this: SpInstance, e: MouseEvent): void {
      const target = e.target as HTMLElement;
      const month = target.closest<HTMLElement>(".calendar-month");
      if (target.closest(".calendar-previous")) {
        this._month = addMonths(this._month as Date, -1);
        this._render();
        return;
      }
      if (target.closest(".calendar-next")) {
        this._month = addMonths(this._month as Date, 1);
        this._render();
        return;
      }
      const day = target.closest<HTMLButtonElement>(".calendar-day");
      if (!day || day.disabled || !month) return;
      this._focus = day.dataset.date;
      this._pick(day.dataset.date as string);
    },

    _onSelectChange(this: SpInstance, e: Event): void {
      const select = e.target as HTMLSelectElement;
      const month = this._month as Date;
      if (select.matches(".calendar-month-select")) {
        this._month = new Date(month.getFullYear(), Number(select.value), 1);
      } else if (select.matches(".calendar-year-select")) {
        this._month = new Date(Number(select.value), month.getMonth(), 1);
      } else return;
      this._render();
    },

    _moveFocus(this: SpInstance, next: Date): void {
      const iso = toIso(next);
      this._focus = iso;
      const count = this.config.months as number;
      const first = this._month as Date;
      const last = addMonths(first, count);
      if (next < first || next >= last) {
        this._month = next < first ? addMonths(next, 0) : addMonths(next, 1 - count);
      }
      this._render();
      (this._body as HTMLElement).querySelector<HTMLElement>(`.calendar-day[data-date="${iso}"]`)?.focus();
    },

    _onKeydown(this: SpInstance, e: KeyboardEvent): void {
      const day = (e.target as HTMLElement).closest<HTMLElement>(".calendar-day");
      if (!day) return;
      const current = parseIso(day.dataset.date) as Date;
      const rtl = getComputedStyle(this.el).direction === "rtl";
      const weekStart = this.config.weekStart as number;
      let next: Date | null = null;
      switch (e.key) {
        case "ArrowRight": next = addDays(current, rtl ? -1 : 1); break;
        case "ArrowLeft": next = addDays(current, rtl ? 1 : -1); break;
        case "ArrowDown": next = addDays(current, 7); break;
        case "ArrowUp": next = addDays(current, -7); break;
        case "Home": next = addDays(current, -((current.getDay() - weekStart + 7) % 7)); break;
        case "End": next = addDays(current, 6 - ((current.getDay() - weekStart + 7) % 7)); break;
        case "PageDown": next = e.shiftKey ? new Date(current.getFullYear() + 1, current.getMonth(), current.getDate()) : new Date(current.getFullYear(), current.getMonth() + 1, current.getDate()); break;
        case "PageUp": next = e.shiftKey ? new Date(current.getFullYear() - 1, current.getMonth(), current.getDate()) : new Date(current.getFullYear(), current.getMonth() - 1, current.getDate()); break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (!(day as HTMLButtonElement).disabled) this._pick(day.dataset.date as string);
          return;
        default:
          return;
      }
      e.preventDefault();
      // Month arithmetic can overflow (Jan 31 + 1 month); clamp to the month's end.
      if ((e.key === "PageDown" || e.key === "PageUp") && next.getDate() !== current.getDate()) {
        next = new Date(next.getFullYear(), next.getMonth(), 0);
      }
      this._moveFocus(next);
    },

    // Move focus into the grid, on the selection, today, or the first day.
    focus(this: SpInstance): void {
      const body = this._body as HTMLElement;
      const target =
        body.querySelector<HTMLElement>(`.calendar-day[data-date="${this._focus}"]`) ??
        body.querySelector<HTMLElement>('.calendar-day[tabindex="0"]');
      target?.focus();
    },
  },
});
