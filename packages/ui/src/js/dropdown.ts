// Anchored menu of items with arrow-key navigation.

import { define } from "./define";
import type { SpInstance } from "./define";
import { isDisabled } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { HoverToShow } from "./mixins/hover-to-show";
import { HoverOutHide } from "./mixins/hover-out-hide";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { FocusOutsideHide } from "./mixins/focus-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Navigable } from "./mixins/navigable";
import { Popoverable } from "./mixins/popoverable";
import { Anchorable } from "./mixins/anchorable";

export const Dropdown = define({
  name: "dropdown",
  selector: "[data-sp-dropdown]",
  mixins: [
    Togglable,
    ClickToShow,
    HoverToShow,
    HoverOutHide,
    ClickOutsideHide,
    FocusOutsideHide,
    Escapable,
    Navigable,
    Popoverable,
    Anchorable,
  ],

  props: {
    placement: { type: String, default: "bottom-end" },
    offset: { type: Number, default: 4 },
    item: { type: String, default: ".dropdown-item" },
  },

  init(this: SpInstance) {
    // Choosing an item closes the menu; disabled items do nothing.
    this.on(this.el, "click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(this.config.item as string);
      if (!item) return;
      if (isDisabled(item)) {
        e.preventDefault();
        return;
      }
      this.hide();
    });
  },
});
