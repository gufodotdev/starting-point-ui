// Menu that opens at the pointer on right click or long press.

import { define } from "./define";
import { Togglable } from "./mixins/togglable";
import { ContextToShow } from "./mixins/context-to-show";
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

export const ContextMenu = define({
  name: "contextMenu",
  selector: ".context-menu",
  mixins: [
    Togglable,
    ContextToShow,
    ClickToShow,
    HoverToShow,
    HoverOutHide,
    ClickOutsideHide,
    FocusOutsideHide,
    Escapable,
    Navigable,
    Popoverable,
    Anchorable,
    Menu("context-menu", () => ContextMenu),
  ],

  props: {
    mode: { type: String, default: "context" },
    placement: { type: String, default: "right-start" },
    offset: { type: Number, default: 0 },
    alignOffset: { type: Number, default: 4 },
    item: { type: String, default: ".context-menu-item" },
  },
});
