// Focus landing outside the panel and trigger hides it (keyboard parity with
// ClickOutsideHide). Shift+Tab back onto the trigger keeps it open.

import type { Mixin, SpInstance } from "../define";

export const FocusOutsideHide: Mixin = {
  init(this: SpInstance) {
    this.on(document, "focusin", (e) => {
      if (!this._isMounted()) return;
      const target = e.target as Node;
      if (this.el.contains(target)) return;
      if (this.trigger?.contains(target)) return;
      this.hide();
    });
  },
};
