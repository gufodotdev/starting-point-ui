// A calendar in a popover behind a trigger, bound to the native date inputs
// inside the root. The picker builds the popover and calendar itself; the
// trigger shows the selection formatted for the locale.

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";
import { ensureId } from "./utils";
import { Calendar, parseIso } from "./calendar";
import { Popover } from "./popover";

const POPOVER_OPTIONS = ["placement", "offset", "align-offset"];

export const DatePicker = define({
  name: "datePicker",
  selector: ".date-picker",

  props: { locale: String },

  init(this: SpInstance) {
    const trigger = this.el.querySelector<HTMLElement>(":scope > button");
    if (!trigger) return;
    this.trigger = trigger;
    // A node that left the DOM and came back still holds the popover it built.
    const popover = (this.el.querySelector<HTMLElement>(":scope > .date-picker-popover") ?? this._build(trigger)) as HTMLElement;
    const calendar = popover.querySelector<HTMLElement>(".calendar") as HTMLElement;
    const inputs = [...calendar.querySelectorAll<HTMLInputElement>(':scope > input[type="date"]')];
    if (!inputs.length) return;

    this._popover = getInstance(popover, Popover);
    this._calendar = getInstance(calendar, Calendar);
    this._label = trigger.querySelector<HTMLElement>(".date-picker-value");
    this._locale = (this.config.locale as string) || document.documentElement.lang || undefined;

    this.on(calendar, "sp-change", (e) => {
      if (e.target !== calendar) return;
      trigger.removeAttribute("aria-invalid");
      this._syncLabel();
      if (this._calendar._mode === "single") this._popover.hide();
    });
    // Script edits and form resets reach the inputs directly.
    this.on(calendar, "change", (e) => {
      if ((e.target as HTMLElement).matches("input")) this._syncLabel();
    });
    const form = inputs[0].form;
    if (form) this.on(form, "reset", () => setTimeout(() => this._syncLabel()));
    // A closed popover is display:none, so the browser can't focus a required
    // input inside it and silently blocks the submit. Open first, and let the
    // trigger carry the invalid state the hidden input can't show.
    for (const input of inputs) {
      this.on(input, "invalid", () => {
        this._reporting = true;
        trigger.setAttribute("aria-invalid", "true");
        this.show();
      });
    }
    this.on(popover, "sp-shown", (e) => {
      if (e.target !== popover) return;
      // Keep the input focused when the browser is reporting it invalid, so its
      // validation message stays visible.
      if (this._reporting) this._reporting = false;
      else this._calendar.focus();
    });

    // A label the server already rendered paints as is; JS only fills a blank one.
    if (!this._label?.textContent?.trim()) this._syncLabel();
  },

  methods: {
    _build(this: SpInstance, trigger: HTMLElement): HTMLElement {
      const popover = document.createElement("div");
      popover.className = "popover date-picker-popover";
      popover.setAttribute("data-sp-toggle", `#${ensureId(trigger)}`);
      if (!this.el.hasAttribute("data-sp-placement")) popover.setAttribute("data-sp-placement", "bottom-start");
      const calendar = document.createElement("div");
      calendar.className = "calendar";
      for (const { name, value } of [...this.el.attributes]) {
        if (!name.startsWith("data-sp-")) continue;
        const option = name.slice("data-sp-".length);
        (POPOVER_OPTIONS.includes(option) ? popover : calendar).setAttribute(name, value);
      }
      // The calendar owns the inputs, hidden prefills included.
      this.el.querySelectorAll<HTMLInputElement>(":scope > input").forEach((input) => calendar.appendChild(input));
      popover.appendChild(calendar);
      this.el.appendChild(popover);
      return popover;
    },

    _syncLabel(this: SpInstance): void {
      const label = this._label as HTMLElement | null;
      const mode = this._calendar._mode as string;
      const value = this._calendar.value();
      let text = "";
      const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(this._locale as string | undefined, opts).format(parseIso(iso) as Date);
      if (mode === "single") {
        text = parseIso(value as string) ? fmt(value as string, { dateStyle: "long" }) : "";
      } else if (mode === "range") {
        const { from, to } = value as { from: string; to: string };
        const short: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
        if (parseIso(from) && parseIso(to)) text = `${fmt(from, short)} - ${fmt(to, short)}`;
        else if (parseIso(from)) text = fmt(from, short);
      } else {
        const values = value as string[];
        text = values.length === 1 ? fmt(values[0], { dateStyle: "long" }) : values.length ? `${values.length} dates` : "";
      }
      if (label) label.textContent = text;
    },

    value(this: SpInstance): unknown {
      return this._calendar.value();
    },
    select(this: SpInstance, value: string | string[] | { from: string; to?: string }): void {
      this._calendar.select(value);
    },
    clear(this: SpInstance): void {
      this._calendar.clear();
    },
    show(this: SpInstance): void {
      this._popover.show({ trigger: this.trigger });
    },
    hide(this: SpInstance): void {
      this._popover.hide();
    },
    toggle(this: SpInstance): void {
      this._popover.toggle({ trigger: this.trigger });
    },
  },
});
