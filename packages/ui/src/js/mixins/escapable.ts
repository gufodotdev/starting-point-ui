// Escape hides the component.

import type { Mixin, SpInstance } from "../define";
import { anchoredPanels } from "../utils";

export const Escapable: Mixin = {
  init(this: SpInstance) {
    this.on(document, "keydown", (e) => {
      // _isMounted, not _isShown: dismiss even mid enter-animation.
      if ((e as KeyboardEvent).key !== "Escape" || !this._isMounted()) return;
      // An Escape from inside a nested panel is that panel's to handle.
      const target = e.target as Node;
      if (anchoredPanels(this.el).slice(1).some((panel) => panel.contains(target))) return;
      this.hide();
    });
  },
};
