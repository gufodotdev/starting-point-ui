// Click / Enter / Space on the trigger toggles the panel and syncs
// aria-expanded / aria-controls. Needs Togglable.

import type { Mixin, SpInstance } from "../define";
import { resolveTrigger } from "../utils";

export const ClickToShow: Mixin = {
  props: { toggle: String },

  init(this: SpInstance) {
    const trigger = resolveTrigger(this);
    if (!trigger) return;

    if (!trigger.hasAttribute("aria-expanded")) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (this.el.id) trigger.setAttribute("aria-controls", this.el.id);

    this.on(trigger, "click", (e) => {
      // On touch, HoverToShow arms _preventClick so the tap that opened us isn't
      // toggled shut by the synthesized click.
      if (this._preventClick) {
        this._preventClick = null;
        e.preventDefault();
        return;
      }
      this.toggle({ trigger });
    });
    this.on(trigger, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        this.toggle({ trigger });
      }
    });

    this.on(this.el, "sp-beforeshow", () => trigger.setAttribute("aria-expanded", "true"));
    this.on(this.el, "sp-beforehide", () => trigger.setAttribute("aria-expanded", "false"));
  },

  destroy(this: SpInstance) {
    this.trigger?.removeAttribute("aria-expanded");
    this.trigger?.removeAttribute("aria-controls");
  },
};
