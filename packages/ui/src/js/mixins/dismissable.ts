// Dismiss concern for modal overlays: [data-sp-dismiss] buttons and backdrop
// clicks close it. With `static`, a backdrop click is refused (fires
// sp:hideprevented) so the user must choose an action; Escape still closes.
// Needs Togglable (hide) on a native <dialog> (backdrop = a click on el itself).

import type { Mixin, SpInstance } from "../define";

export const Dismissable: Mixin = {
  props: { static: Boolean },

  init(this: SpInstance) {
    this.el.querySelectorAll<HTMLElement>("[data-sp-dismiss]").forEach((btn) => {
      this.on(btn, "click", () => this.hide());
    });

    // A click whose target is the <dialog> itself landed on the backdrop.
    this.on(this.el, "click", (e) => {
      if (e.target !== this.el) return;
      if (this.config.static) this.emit("hideprevented");
      else this.hide();
    });
  },
};
