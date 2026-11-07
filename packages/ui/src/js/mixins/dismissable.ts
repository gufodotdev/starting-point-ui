// A [data-sp-dismiss] button inside the overlay hides it.

import type { Mixin, SpInstance } from "../define";

const handled = new WeakSet<Event>();

export const Dismissable: Mixin = {
  init(this: SpInstance) {
    // Delegated so buttons rendered later work too. Only the innermost
    // overlay acts, as the click bubbles through every one around it.
    this.on(this.el, "click", (e) => {
      const btn = (e.target as Element).closest("[data-sp-dismiss]");
      if (!btn || !this.el.contains(btn) || handled.has(e)) return;
      handled.add(e);
      this.hide();
    });
  },
};
