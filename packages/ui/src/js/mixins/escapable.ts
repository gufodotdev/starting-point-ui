// Escape hides the component.

import type { Mixin, SpInstance } from "../define";

export const Escapable: Mixin = {
  init(this: SpInstance) {
    this.on(document, "keydown", (e) => {
      // _isMounted, not _isShown: dismiss even mid enter-animation.
      if ((e as KeyboardEvent).key === "Escape" && this._isMounted()) this.hide();
    });
  },
};
