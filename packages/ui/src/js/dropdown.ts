// Anchored menu of items with arrow-key navigation.

import { define } from "./define";
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
import { Menu } from "./mixins/menu";

export const Dropdown = define({
  name: "dropdown",
  selector: ".dropdown",
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
    Menu("dropdown", () => Dropdown),
  ],

  props: {
    placement: { type: String, default: "bottom-end" },
    offset: { type: Number, default: 4 },
    item: { type: String, default: ".dropdown-item" },
  },
});
