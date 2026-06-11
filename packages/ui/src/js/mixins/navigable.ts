// Arrow-key navigation between the panel's items: Down/Up move and wrap around,
// Home/End jump, disabled items are skipped. Also listens on the trigger so
// ArrowDown enters the list of an already-open panel.

import type { Mixin, SpInstance } from "../define";
import { findNextEnabled, isDisabled, resolveTrigger } from "../utils";

export const Navigable: Mixin = {
  props: { item: String },

  init(this: SpInstance) {
    const onKeydown = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) return;
      if (!this._isMounted()) return;
      e.preventDefault();

      const items = [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
      const current = items.indexOf(document.activeElement as HTMLElement);
      const first = items.find((item) => !isDisabled(item)) ?? null;
      const last = [...items].reverse().find((item) => !isDisabled(item)) ?? null;

      let next: HTMLElement | null = null;
      if (key === "ArrowDown") next = current < 0 ? first : findNextEnabled(items, current, 1);
      else if (key === "ArrowUp") next = current < 0 ? last : findNextEnabled(items, current, -1);
      else if (key === "Home") next = first;
      else next = last;

      next?.focus();
    };

    this.on(this.el, "keydown", onKeydown);
    const trigger = resolveTrigger(this);
    if (trigger) this.on(trigger, "keydown", onKeydown);
  },
};
