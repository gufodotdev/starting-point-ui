// Non-modal overlay anchored to a trigger.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, resolveTrigger } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { HoverToShow } from "./mixins/hover-to-show";
import { HoverOutHide } from "./mixins/hover-out-hide";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { FocusOutsideHide } from "./mixins/focus-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Popoverable } from "./mixins/popoverable";
import { Anchorable } from "./mixins/anchorable";

export const Popover = define({
  name: "popover",
  selector: ".popover",
  mixins: [
    Togglable,
    ClickToShow,
    HoverToShow,
    HoverOutHide,
    ClickOutsideHide,
    FocusOutsideHide,
    Escapable,
    Popoverable,
    Anchorable,
  ],

  props: {
    placement: { type: String, default: "bottom" },
  },

  init(this: SpInstance) {
    // WAI-ARIA non-modal dialog semantics, applied unless authored.
    const trigger = resolveTrigger(this);
    trigger?.setAttribute("aria-haspopup", "dialog");
    if (!this.el.hasAttribute("role")) this.el.setAttribute("role", "dialog");
    if (trigger && !this.el.hasAttribute("aria-label") && !this.el.hasAttribute("aria-labelledby")) {
      this.el.setAttribute("aria-labelledby", ensureId(trigger));
    }
  },
});
