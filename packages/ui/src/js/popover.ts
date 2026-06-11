// Non-modal overlay anchored to a trigger.

import { define } from "./define";
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
  selector: "[data-sp-popover]",
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
});
