// Menu behavior shared by the dropdown and context menu: WAI-ARIA menu
// semantics, checkable items backed by hidden inputs, submenu keys, and
// closing on choice. `prefix` is the class family, `self` the component
// factory (looked up lazily because it is defined after its mixins).

import type { ComponentFactory, Mixin, SpInstance } from "../define";
import { getInstance } from "../observer";
import { ensureId, isDisabled, resolveTrigger } from "../utils";

export function Menu(prefix: string, self: () => ComponentFactory): Mixin {
  return {
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
        .querySelectorAll<HTMLElement>(`.${prefix}-item-checkbox, .${prefix}-item-radio`)
        .forEach((item) => {
          if (!item.hasAttribute("role")) {
            const radio = item.classList.contains(`${prefix}-item-radio`);
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
      this.el.querySelectorAll<HTMLElement>(`.${prefix}-separator`).forEach((sep) => {
        if (!sep.hasAttribute("role")) sep.setAttribute("role", "separator");
      });

      // Enter/Space activate the focused item; one synthesized click covers both
      // link items (no native Space activation) and button items (no doubling).
      // Submenu triggers open with Enter/Space/ArrowRight (focusing the first
      // sub item), and ArrowLeft in a submenu closes it back to its trigger.
      // In RTL the arrows invert: submenus open toward the reading direction.
      this.on(this.el, "keydown", (e) => {
        const key = (e as KeyboardEvent).key;
        const rtl = getComputedStyle(this.el).direction === "rtl";
        const openKey = rtl ? "ArrowLeft" : "ArrowRight";
        const closeKey = rtl ? "ArrowRight" : "ArrowLeft";
        if (key === closeKey && this.trigger?.matches('[role^="menuitem"]')) {
          e.preventDefault();
          this.hide();
          this.trigger.focus();
          return;
        }
        const item = (e.target as HTMLElement).closest<HTMLElement>(this.config.item as string);
        if (!item) return;
        if (key === openKey && item.hasAttribute("aria-haspopup")) {
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
            if (panel?.classList.contains(prefix)) getInstance(panel, self())?.hide();
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
          // Toggle through click() so the change event is native and reaches
          // every listener, including React's click-based onChange.
          if (e.target !== input) input.click();
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
        const sub = panel ? getInstance(panel, self()) : null;
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
          .querySelectorAll<HTMLElement>(`.${prefix}-item-checkbox, .${prefix}-item-radio`)
          .forEach((item) => {
            const input = item.querySelector<HTMLInputElement>("input");
            if (input) item.setAttribute("aria-checked", String(input.checked));
          });
      },

      // Choosing an item dismisses the whole menu chain, not just this panel.
      _hideParentMenus(this: SpInstance): void {
        let panel = (this.trigger?.closest(`.${prefix}`) ?? null) as HTMLElement | null;
        while (panel) {
          const menu = getInstance(panel, self());
          if (!menu) return;
          menu.hide();
          panel = (menu.trigger?.closest(`.${prefix}`) ?? null) as HTMLElement | null;
        }
      },
    },
  };
}
