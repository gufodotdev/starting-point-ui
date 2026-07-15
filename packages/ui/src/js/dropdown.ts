// Anchored menu of items with arrow-key navigation.

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";
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
    // Checkable items hold their state in a hidden native input (combobox-
    // style), so change events, form data, and :checked queries all work; the
    // item carries the menu role and mirrors the input onto aria-checked.
    // Their roles resolve first so the generic menuitem fallback below leaves
    // them alone.
    this.el
      .querySelectorAll<HTMLElement>(".dropdown-item-checkbox, .dropdown-item-radio")
      .forEach((item) => {
        if (!item.hasAttribute("role")) {
          const radio = item.classList.contains("dropdown-item-radio");
          item.setAttribute("role", radio ? "menuitemradio" : "menuitemcheckbox");
        }
        const input = item.querySelector<HTMLInputElement>("input");
        if (input) input.tabIndex = -1;
        item.setAttribute("aria-checked", String(input?.checked ?? false));
      });
    this.on(this.el, "change", () => this._syncChecked());
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
    // Submenu triggers open with Enter/Space/ArrowRight (focusing the first
    // sub item), and ArrowLeft in a submenu closes it back to its trigger.
    this.on(this.el, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === "ArrowLeft" && this.trigger?.matches('[role^="menuitem"]')) {
        e.preventDefault();
        this.hide();
        this.trigger.focus();
        return;
      }
      const item = (e.target as HTMLElement).closest<HTMLElement>(this.config.item as string);
      if (!item) return;
      if (key === "ArrowRight" && item.hasAttribute("aria-haspopup")) {
        e.preventDefault();
        if (!isDisabled(item)) this._openSub(item);
        return;
      }
      if (key !== "Enter" && key !== " ") return;
      e.preventDefault();
      if (isDisabled(item)) return;
      if (item.hasAttribute("aria-haspopup")) {
        this._openSub(item);
        return;
      }
      item.click();
    });

    // Closing this menu closes any submenus opened from it.
    this.on(this.el, "sp-hide", (e) => {
      if (e.target !== this.el) return;
      this.el
        .querySelectorAll<HTMLElement>('[aria-controls][aria-expanded="true"]')
        .forEach((trig) => {
          const panel = document.getElementById(trig.getAttribute("aria-controls") as string);
          if (panel?.classList.contains("dropdown")) getInstance(panel, Dropdown)?.hide();
        });
    });

    // Choosing an item closes the menu; disabled items do nothing. A checkable
    // item forwards the click into its input (radios uncheck same-name peers
    // natively), and a nested menu's trigger is left to its own toggle so
    // opening a submenu doesn't close this menu.
    this.on(this.el, "click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(this.config.item as string);
      if (!item) return;
      if (isDisabled(item)) {
        e.preventDefault();
        return;
      }
      if (item.hasAttribute("aria-haspopup")) return;
      const input = item.querySelector<HTMLInputElement>(
        'input[type="checkbox"], input[type="radio"]',
      );
      if (input) {
        if (e.target !== input) {
          input.checked = input.type === "radio" ? true : !input.checked;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        // Toggles are settings, not commands: the menu stays open so the
        // user can flip several or change their mind.
        return;
      }
      this.hide();
      this._hideParentMenus();
    });
  },

  methods: {
    // Opens the submenu anchored to `item` and moves focus into it. A no-op
    // show when it's already open still refocuses the first item.
    _openSub(this: SpInstance, item: HTMLElement): void {
      const panel = document.getElementById(item.getAttribute("aria-controls") ?? "");
      const sub = panel ? getInstance(panel, Dropdown) : null;
      if (!sub) return;
      sub.show({ trigger: item });
      panel!
        .querySelector<HTMLElement>(`${this.config.item}:not([aria-disabled="true"])`)
        ?.focus();
    },

    // aria-checked mirrors the inputs; a radio pick unchecks its same-name
    // peers without firing events on them, so every mirror resyncs.
    _syncChecked(this: SpInstance): void {
      this.el
        .querySelectorAll<HTMLElement>(".dropdown-item-checkbox, .dropdown-item-radio")
        .forEach((item) => {
          const input = item.querySelector<HTMLInputElement>("input");
          if (input) item.setAttribute("aria-checked", String(input.checked));
        });
    },

    // Choosing an item dismisses the whole menu chain, not just this panel.
    _hideParentMenus(this: SpInstance): void {
      let panel = (this.trigger?.closest(".dropdown") ?? null) as HTMLElement | null;
      while (panel) {
        const menu = getInstance(panel, Dropdown);
        if (!menu) return;
        menu.hide();
        panel = (menu.trigger?.closest(".dropdown") ?? null) as HTMLElement | null;
      }
    },
  },
});
