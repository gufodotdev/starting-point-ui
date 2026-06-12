// Anchored menu of items with arrow-key navigation.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, isDisabled, resolveTrigger } from "./utils";
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
    // WAI-ARIA menu button semantics, applied unless the author set their own.
    const trigger = resolveTrigger(this);
    trigger?.setAttribute("aria-haspopup", "menu");
    if (!this.el.hasAttribute("role")) this.el.setAttribute("role", "menu");
    if (trigger && !this.el.hasAttribute("aria-label") && !this.el.hasAttribute("aria-labelledby")) {
      this.el.setAttribute("aria-labelledby", ensureId(trigger));
    }
    this.el.querySelectorAll<HTMLElement>(this.config.item as string).forEach((item) => {
      if (!item.hasAttribute("role")) item.setAttribute("role", "menuitem");
      // Roving tabindex: arrows navigate the menu, Tab leaves and closes it.
      item.tabIndex = -1;
    });
    this.el.querySelectorAll<HTMLElement>(".dropdown-separator").forEach((sep) => {
      if (!sep.hasAttribute("role")) sep.setAttribute("role", "separator");
    });

    // Enter/Space activate the focused item; one synthesized click covers both
    // link items (no native Space activation) and button items (no doubling).
    this.on(this.el, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key !== "Enter" && key !== " ") return;
      const item = (e.target as HTMLElement).closest<HTMLElement>(this.config.item as string);
      if (!item) return;
      e.preventDefault();
      if (!isDisabled(item)) item.click();
    });

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
