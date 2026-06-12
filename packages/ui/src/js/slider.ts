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
