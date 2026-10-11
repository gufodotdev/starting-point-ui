// Floating toolbar for the actions on a selection, non-modal in the top layer.

import { define } from "./define";
import type { SpInstance } from "./define";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Dismissable } from "./mixins/dismissable";
import { Escapable } from "./mixins/escapable";
import { Popoverable } from "./mixins/popoverable";
import { Navigable } from "./mixins/navigable";

export const ActionBar = define({
  name: "actionBar",
  selector: ".action-bar",
  mixins: [
    Togglable,
    ClickToShow,
    Dismissable,
    Escapable,
    Popoverable,
    Navigable,
  ],

  props: {
    item: { type: String, default: ".btn" },
    orientation: { type: String, default: "horizontal" },
  },

  init(this: SpInstance) {
    // WAI-ARIA toolbar semantics, applied unless authored.
    if (!this.el.hasAttribute("role")) this.el.setAttribute("role", "toolbar");
  },
});
