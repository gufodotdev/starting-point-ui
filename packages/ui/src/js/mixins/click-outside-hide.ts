// A press outside the panel and trigger hides it (non-modal overlays; modal
// backdrop dismissal lives in Modalable).

import type { Mixin, SpInstance } from "../define";

export const ClickOutsideHide: Mixin = {
  init(this: SpInstance) {
    this.on(document, "pointerdown", (e) => {
      if (!this._isMounted()) return;
      const target = e.target as Node;
      if (this.el.contains(target)) return;
      if (this.trigger?.contains(target)) return;
      this.hide();
    });
  },
};
