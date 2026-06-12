// Arrow-key navigation between the panel's items: Down/Up move and wrap around,
// Home/End jump, disabled items are skipped. On the trigger of a closed panel,
// Down/Up open it and activate the first/last item; Enter/Space (toggled by
// ClickToShow, which registers first) activate the first item on open.
// The active-item mechanism (_activeIndex/_setActive) defaults to DOM focus;
// components override both for virtual highlighting.

import type { Mixin, SpInstance } from "../define";
import { findNextEnabled, isDisabled, resolveTrigger } from "../utils";

const NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

export const Navigable: Mixin = {
  props: { item: String },

  init(this: SpInstance) {
    const items = () => [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
    const first = (list: HTMLElement[]) => list.find((item) => !isDisabled(item)) ?? null;
    const last = (list: HTMLElement[]) => [...list].reverse().find((item) => !isDisabled(item)) ?? null;

    const onKeydown = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (!NAV_KEYS.includes(key)) return;
      if (!this._isMounted()) return;
      // Home/End in a text field move the caret, not the active item.
      if ((key === "Home" || key === "End") && (e.target as HTMLElement).matches("input, textarea")) return;
      e.preventDefault();

      const list = items();
      const current = this._activeIndex(list);
      let next: HTMLElement | null = null;
      if (key === "ArrowDown") next = current < 0 ? first(list) : findNextEnabled(list, current, 1);
      else if (key === "ArrowUp") next = current < 0 ? last(list) : findNextEnabled(list, current, -1);
      else if (key === "Home") next = first(list);
      else next = last(list);

      if (next) this._setActive(next);
    };

    this.on(this.el, "keydown", onKeydown);

    const trigger = resolveTrigger(this);
    if (!trigger) return;
    this.on(trigger, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === "Enter" || key === " ") {
        if (this._isShown() || this.el.classList.contains("show")) {
          const target = first(items());
          if (target) this._setActive(target);
        }
        return;
      }
      if (this._isMounted()) {
        onKeydown(e);
        return;
      }
      if (key !== "ArrowDown" && key !== "ArrowUp") return;
      e.preventDefault();
      this.show({ trigger });
      if (!this._isMounted()) return; // sp-beforeshow was vetoed
      const target = key === "ArrowDown" ? first(items()) : last(items());
      if (target) this._setActive(target);
    });
  },

  methods: {
    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.indexOf(document.activeElement as HTMLElement);
    },
    _setActive(this: SpInstance, item: HTMLElement): void {
      item.focus();
    },
  },
};
