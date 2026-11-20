// Paints the filled track of a range input and mirrors its value.

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";

export const Slider = define({
  name: "slider",
  selector: 'input[type="range"].slider',

  init(this: SpInstance) {
    this.update();
    this.on(this.el, "input", () => this.update());
  },

  methods: {
    // Also the public refresh for programmatic value/min/max changes.
    update(this: SpInstance): void {
      const el = this.el as HTMLInputElement;
      // Unset min/max read as ""; the native range defaults are 0 and 100.
      const min = el.min === "" ? 0 : Number(el.min);
      const max = el.max === "" ? 100 : Number(el.max);
      const pct = ((Number(el.value) - min) / (max - min)) * 100;
      el.style.setProperty("--val", `${pct}%`);

      if (!el.id) return;
      document
        .querySelectorAll<HTMLElement>(`[data-sp-slider-value="${CSS.escape(el.id)}"]`)
        .forEach((target) => {
          target.textContent = el.value;
        });
    },
  },
});

// Overlays several range inputs on one shared track: each thumb stays
// interactive while the wrapper paints the fill between the outer values.
export const SliderRange = define({
  name: "sliderRange",
  selector: ".slider-range",

  init(this: SpInstance) {
    this._inputs = [...this.el.querySelectorAll<HTMLInputElement>('input[type="range"]')];
    this.update();
    for (const input of this._inputs) {
      this.on(input, "pointerdown", () => this._grab(input));
      this.on(input, "keydown", () => (this._grabbed = null));
      this.on(input, "input", () => {
        if (this._grabbed === input) this._push(input);
        else this._clamp(input);
        this.update();
      });
    }
    this.on(document, "pointerup", () => this._release());
    this.on(document, "pointercancel", () => this._release());
  },

  methods: {
    // Outside a drag, a thumb stops at its neighbors.
    _clamp(this: SpInstance, moved: HTMLInputElement): void {
      const inputs = this._inputs as HTMLInputElement[];
      const i = inputs.indexOf(moved);
      const values = inputs.map((el) => Number(el.value));
      if (i > 0) values[i] = Math.max(values[i], values[i - 1]);
      if (i < values.length - 1) values[i] = Math.min(values[i], values[i + 1]);
      this._write(values);
    },

    // Values set in code fire no input event, so each slider repaints here.
    _write(this: SpInstance, values: number[]): void {
      (this._inputs as HTMLInputElement[]).forEach((el, i) => {
        if (Number(el.value) === values[i]) return;
        el.value = String(values[i]);
        getInstance(el, Slider)?.update();
      });
    },

    _grab(this: SpInstance, input: HTMLInputElement): void {
      const inputs = this._inputs as HTMLInputElement[];
      const values = inputs.map((el) => Number(el.value));
      const max = input.max === "" ? 100 : Number(input.max);
      let active = inputs.indexOf(input);
      // Thumbs stacked at the max can only move down, so the lowest takes the drag.
      while (active > 0 && values[active] === max && values[active - 1] === max) active--;
      this._grabbed = input;
      this._active = active;
      this._values = values;
      this._start = inputs.map((el) => el.value);
    },

    // The dragged thumb pushes its neighbors along, and they stay where
    // they were pushed. The browser moves the grabbed input even when a
    // lower thumb took the drag, so every value is written back.
    _push(this: SpInstance, grabbed: HTMLInputElement): void {
      const values = (this._values as number[]).slice();
      const active = this._active as number;
      values[active] = Number(grabbed.value);
      for (let i = active + 1; i < values.length; i++) values[i] = Math.max(values[i], values[i - 1]);
      for (let i = active - 1; i >= 0; i--) values[i] = Math.min(values[i], values[i + 1]);
      this._values = values;
      this._write(values);
    },

    // The browser fires change only on the grabbed input, so the thumbs the
    // drag moved fire their own.
    _release(this: SpInstance): void {
      const grabbed = this._grabbed as HTMLInputElement | null;
      if (!grabbed) return;
      this._grabbed = null;
      const start = this._start as string[];
      (this._inputs as HTMLInputElement[]).forEach((el, i) => {
        if (el !== grabbed && el.value !== start[i]) {
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    },

    // Also the public refresh for programmatic value changes.
    update(this: SpInstance): void {
      const inputs = this._inputs as HTMLInputElement[];
      if (!inputs.length) return;
      const pct = (el: HTMLInputElement) => {
        const min = el.min === "" ? 0 : Number(el.min);
        const max = el.max === "" ? 100 : Number(el.max);
        return ((Number(el.value) - min) / (max - min)) * 100;
      };
      this.el.style.setProperty("--val-min", `${pct(inputs[0])}%`);
      this.el.style.setProperty("--val-max", `${pct(inputs[inputs.length - 1])}%`);
    },
  },
});
