// A [data-sp-dismiss] button inside the overlay hides it.

import type { Mixin, SpInstance } from "../define";

export const Dismissable: Mixin = {
  init(this: SpInstance) {
    this.el.querySelectorAll<HTMLElement>("[data-sp-dismiss]").forEach((btn) => {
      this.on(btn, "click", () => this.hide());
    });
  },
};
