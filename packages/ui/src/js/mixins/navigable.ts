// Arrow-key navigation between the panel's items: Down/Up move and wrap around,
// Home/End jump, disabled items are skipped. On the trigger of a closed panel,
// Down/Up open it and activate the first/last item; Enter/Space (toggled by
// ClickToShow, which registers first) activate the first item on open.
// The active-item mechanism (_activeIndex/_setActive) defaults to DOM focus;
// components override both for virtual highlighting.

import type { Mixin, SpInstance } from "../define";
import { findNextEnabled, isDisabled, resolveTrigger } from "../utils";

export const Navigable: Mixin = {
  props: {
    item: String,
    orientation: { type: String, default: "vertical" },
  },

  init(this: SpInstance) {
    const [nextKey, prevKey] =
      this.config.orientation === "horizontal"
        ? ["ArrowRight", "ArrowLeft"]
        : ["ArrowDown", "ArrowUp"];

    const items = () => [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
    const first = (list: HTMLElement[]) => list.find((item) => !isDisabled(item)) ?? null;
    const last = (list: HTMLElement[]) => [...list].reverse().find((item) => !isDisabled(item)) ?? null;

    const navigate = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (![nextKey, prevKey, "Home", "End"].includes(key)) return;
      if (!this._isMounted()) return;
      // Home/End in a text field move the caret, not the active item.
      if ((key === "Home" || key === "End") && (e.target as HTMLElement).matches("input, textarea")) return;
      e.preventDefault();

      const list = items();
      const current = this._activeIndex(list);
      let next: HTMLElement | null = null;
      if (key === nextKey) next = current < 0 ? first(list) : findNextEnabled(list, current, 1);
      else if (key === prevKey) next = current < 0 ? last(list) : findNextEnabled(list, current, -1);
      else if (key === "Home") next = first(list);
      else next = last(list);

      if (next) this._setActive(next);
    };

    this.on(this.el, "keydown", (e) => {
      if (this._navigates(e.target as HTMLElement)) navigate(e);
    });

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
        navigate(e);
        return;
      }
      if (key !== nextKey && key !== prevKey) return;
      e.preventDefault();
      this.show({ trigger });
      if (!this._isMounted()) return; // sp-beforeshow was vetoed
      const target = key === nextKey ? first(items()) : last(items());
      if (target) this._setActive(target);
    });
  },

  methods: {
    // Arrow keys only act when they come from an item, so widgets inside the
    // panel content keep their own key handling.
    _navigates(this: SpInstance, target: HTMLElement): boolean {
      return !!target.closest(this.config.item as string);
    },
    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.indexOf(document.activeElement as HTMLElement);
    },
    _setActive(this: SpInstance, item: HTMLElement): void {
      item.focus();
    },
  },
};
