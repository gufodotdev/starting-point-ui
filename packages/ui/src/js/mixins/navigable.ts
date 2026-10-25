// Arrow-key navigation between the panel's items: Down/Up move and wrap around,
// Home/End jump, disabled items are skipped. With orientation "both", for
// items laid out in columns, Left/Right also move: across to the nearest item
// in the next column, read from where the items render, so any grid, flex or
// column layout works. On the trigger of a closed panel,
// Down/Up open it and activate the first/last item; Enter/Space (toggled by
// ClickToShow, which registers first) activate the first item on open.
// The active-item mechanism (_activeIndex/_setActive) defaults to DOM focus;
// components override both for virtual highlighting.

import type { Mixin, SpInstance } from "../define";
import { findNextEnabled, isDisabled, resolveTrigger } from "../utils";

// The nearest item in the next column on screen, wrapping to the far column;
// null when there is none.
function across(from: HTMLElement, list: HTMLElement[], direction: 1 | -1): HTMLElement | null {
  const box = (el: HTMLElement) => el.getBoundingClientRect();
  const origin = box(from);
  const shown = list.filter((el) => el !== from && !isDisabled(el) && box(el).width > 0);
  const after = (r: DOMRect) => r.left >= origin.right - 1;
  const before = (r: DOMRect) => r.right <= origin.left + 1;
  const ahead = shown.filter((el) => (direction > 0 ? after(box(el)) : before(box(el))));
  const behind = shown.filter((el) => (direction > 0 ? before(box(el)) : after(box(el))));
  const pool = ahead.length ? ahead : behind;
  if (!pool.length) return null;
  const edge = (r: DOMRect) => (direction > 0 ? r.left : -r.right);
  const nearest = pool.reduce((x, y) => (edge(box(y)) < edge(box(x)) ? y : x));
  const lane = box(nearest);
  const column = pool.filter((el) => box(el).left < lane.right && box(el).right > lane.left);
  const middle = origin.top + origin.height / 2;
  const offset = (el: HTMLElement) => Math.abs(box(el).top + box(el).height / 2 - middle);
  return column.reduce((x, y) => (offset(y) < offset(x) ? y : x));
}

export const Navigable: Mixin = {
  props: {
    item: String,
    orientation: { type: String, default: "vertical" },
  },

  init(this: SpInstance) {
    // Resolved per keypress: horizontal arrows follow the reading direction,
    // so ArrowLeft advances in rtl, and a runtime dir change just works.
    const keys = (): [string[], string[]] => {
      const rtl = getComputedStyle(this.el).direction === "rtl";
      const [forward, back] = rtl ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];
      if (this.config.orientation === "horizontal") return [[forward], [back]];
      if (this.config.orientation === "both") return [["ArrowDown", forward], ["ArrowUp", back]];
      return [["ArrowDown"], ["ArrowUp"]];
    };
    // With "both", only Down and Up open the panel, leaving the side arrows to
    // the trigger's surroundings.
    const openKeys = (): [string[], string[]] =>
      this.config.orientation === "horizontal" ? keys() : [["ArrowDown"], ["ArrowUp"]];

    const items = () => [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
    const first = (list: HTMLElement[]) => list.find((item) => !isDisabled(item)) ?? null;
    const last = (list: HTMLElement[]) => [...list].reverse().find((item) => !isDisabled(item)) ?? null;

    const navigate = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      const [nextKeys, prevKeys] = keys();
      if (![...nextKeys, ...prevKeys, "Home", "End"].includes(key)) return;
      if (!this._isMounted()) return;
      // Home/End in a text field move the caret, not the active item.
      if ((key === "Home" || key === "End") && (e.target as HTMLElement).matches("input, textarea")) return;
      e.preventDefault();

      const list = items();
      const current = this._activeIndex(list);
      let next: HTMLElement | null = null;
      const side = key === "ArrowLeft" || key === "ArrowRight";
      if (this.config.orientation === "both" && side && current >= 0) {
        next = across(list[current], list, key === "ArrowRight" ? 1 : -1);
      }
      if (!next) {
        if (nextKeys.includes(key)) next = current < 0 ? first(list) : findNextEnabled(list, current, 1);
        else if (prevKeys.includes(key)) next = current < 0 ? last(list) : findNextEnabled(list, current, -1);
        else if (key === "Home") next = first(list);
        else next = last(list);
      }

      if (next) this._setActive(next);
    };

    this.on(this.el, "keydown", (e) => {
      // A panel sitting in the page flow leaves its keys to what it sits in.
      if (this._isInFlow?.()) return;
      if (this._navigates(e.target as HTMLElement)) navigate(e);
    });

    const trigger = resolveTrigger(this);
    if (!trigger) return;
    this.on(trigger, "keydown", (e) => {
      // A menu-item trigger belongs to the parent menu's arrow navigation;
      // the component opens its submenu with its own keys (e.g. ArrowRight).
      // Text-control triggers (combobox fields) also own their keys.
      if (trigger.matches('[role^="menuitem"], input, textarea')) return;
      if (trigger.querySelector("input, textarea")) return;
      if (this._isInFlow?.()) return;
      const key = (e as KeyboardEvent).key;
      if (key === "Enter" || key === " ") {
        // Some panels open in place and leave focus on their trigger.
        if (this._keepsFocusOnOpen?.()) return;
        if (this._isShown() || this.el.classList.contains("show")) {
          const target = first(items());
          if (target) this._setActive(target);
        }
        return;
      }
      const [openNext, openPrev] = openKeys();
      if (this._isMounted()) {
        if ([...openNext, ...openPrev, "Home", "End"].includes(key)) navigate(e);
        return;
      }
      if (!openNext.includes(key) && !openPrev.includes(key)) return;
      e.preventDefault();
      this.show({ trigger });
      if (!this._isMounted()) return; // sp-beforeshow was vetoed
      const target = openNext.includes(key) ? first(items()) : last(items());
      if (target) this._setActive(target);
    });
  },

  methods: {
    // Arrow keys only act when they come from an item or the panel itself, so
    // widgets inside the panel content keep their own key handling.
    _navigates(this: SpInstance, target: HTMLElement): boolean {
      return target === this.el || !!target.closest(this.config.item as string);
    },
    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.indexOf(document.activeElement as HTMLElement);
    },
    _setActive(this: SpInstance, item: HTMLElement): void {
      item.focus();
    },
  },
};
