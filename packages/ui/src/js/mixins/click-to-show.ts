// Click / Enter / Space on the trigger toggles the panel and syncs
// aria-expanded / aria-controls. Needs Togglable.

import type { Mixin, SpInstance } from "../define";
import { ensureId, resolveTrigger } from "../utils";

export const ClickToShow: Mixin = {
  props: { toggle: String },

  init(this: SpInstance) {
    const trigger = resolveTrigger(this);
    if (!trigger) return;

    if (!trigger.hasAttribute("aria-expanded")) {
      trigger.setAttribute("aria-expanded", "false");
    }
    trigger.setAttribute("aria-controls", ensureId(this.el));

    this.on(trigger, "click", (e) => {
      // The browser default is never wanted on a toggle trigger: an untyped
      // <button> in a form would submit it, a link would navigate.
      e.preventDefault();
      // On touch, HoverToShow arms _preventClick so the tap that opened us isn't
      // toggled shut by the synthesized click.
      if (this._preventClick) {
        this._preventClick = null;
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

    // Guard against nested collapsibles: their lifecycle events bubble through
    // this panel, so only react to our own.
    this.on(this.el, "sp-beforeshow", (e) => {
      if (e.target === this.el) trigger.setAttribute("aria-expanded", "true");
    });
    this.on(this.el, "sp-beforehide", (e) => {
      if (e.target === this.el) trigger.setAttribute("aria-expanded", "false");
    });
  },

  destroy(this: SpInstance) {
    this.trigger?.removeAttribute("aria-expanded");
    this.trigger?.removeAttribute("aria-controls");
  },
};
