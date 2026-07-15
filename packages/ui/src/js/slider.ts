// Paints the filled track of a range input and mirrors its value.

import { define } from "./define";
import type { SpInstance } from "./define";

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
      this.on(input, "input", () => {
        this._clamp(input);
        this.update();
      });
    }
  },

  methods: {
    // Thumbs may meet but never cross their neighbors.
    _clamp(this: SpInstance, moved: HTMLInputElement): void {
      const inputs = this._inputs as HTMLInputElement[];
      const i = inputs.indexOf(moved);
      const value = Number(moved.value);
      const prev = inputs[i - 1];
      const next = inputs[i + 1];
      if (prev && value < Number(prev.value)) moved.value = prev.value;
      if (next && value > Number(next.value)) moved.value = next.value;
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
