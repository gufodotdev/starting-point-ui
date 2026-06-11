// Hides when the pointer leaves both the trigger and panel, with a bridge so
// crossing the gap between them doesn't hide it. Wired only when mode:hover.

import type { Mixin, SpInstance } from "../define";
import { resolveTrigger } from "../utils";

export const HoverOutHide: Mixin = {
  props: {
    toggle: String,
    mode: { type: String, default: "click" },
  },

  init(this: SpInstance) {
    if (this.config.mode !== "hover") return;
    const trigger = resolveTrigger(this);
    if (!trigger) return;

    const overEither = () => trigger.matches(":hover") || this.el.matches(":hover");
    const scheduleHide = () => {
      clearTimeout(this._hoverT as ReturnType<typeof setTimeout>);
      this._hoverT = setTimeout(() => {
        if (!overEither()) this.hide();
      }, 120);
    };

    this.on(trigger, "pointerleave", scheduleHide);
    this.on(trigger, "focusout", scheduleHide);
    // the bridge: entering the panel cancels a pending hide; leaving schedules it
    this.on(this.el, "pointerenter", () => clearTimeout(this._hoverT as ReturnType<typeof setTimeout>));
    this.on(this.el, "pointerleave", scheduleHide);
  },
};
