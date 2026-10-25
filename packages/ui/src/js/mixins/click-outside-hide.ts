// A press outside the panel and trigger hides it (non-modal overlays; modal
// backdrop dismissal lives in Modalable).

import type { Mixin, SpInstance } from "../define";
import { anchoredPanels } from "../utils";

export const ClickOutsideHide: Mixin = {
  init(this: SpInstance) {
    this.on(document, "pointerdown", (e) => {
      if (!this._isMounted()) return;
      // A panel in the page flow, like one folded into a navbar drawer, is not
      // an overlay.
      if (this._isInFlow?.()) return;
      const target = e.target as Node;
      if (anchoredPanels(this.el).some((panel) => panel.contains(target))) return;
      if (this.trigger?.contains(target)) return;
      this.hide();
    });
  },
};
