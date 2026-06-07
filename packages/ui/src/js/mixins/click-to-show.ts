// Click / Enter / Space on the trigger toggles the panel and syncs
// aria-expanded / aria-controls. Needs Togglable.

import type { Mixin, SpInstance } from "../define";

export const ClickToShow: Mixin = {
  props: { toggle: String }, // selector for the trigger element

  init(this: SpInstance) {
    const trigger = this._resolveTrigger();
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

    this.on(this.el, "sp:beforeshow", () => trigger.setAttribute("aria-expanded", "true"));
    this.on(this.el, "sp:beforehide", () => trigger.setAttribute("aria-expanded", "false"));
  },

  destroy(this: SpInstance) {
    this.trigger?.removeAttribute("aria-expanded");
    this.trigger?.removeAttribute("aria-controls");
  },

  methods: {
    // Resolve the trigger from config.toggle once, then cache it on the instance.
    _resolveTrigger(this: SpInstance): HTMLElement | null {
      if (this.trigger === undefined) {
        const sel = this.config.toggle as string | undefined;
        this.trigger = sel ? document.querySelector<HTMLElement>(sel) : null;
      }
      return this.trigger ?? null;
    },
  },
};
