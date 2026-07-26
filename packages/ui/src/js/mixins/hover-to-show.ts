// pointerenter / focusin on the trigger shows the panel. Wired only when
// mode:hover; pair with HoverOutHide.

import type { Mixin, SpInstance } from "../define";
import { resolveTrigger } from "../utils";

export const HoverToShow: Mixin = {
  props: {
    toggle: String,
    mode: { type: String, default: "click" },
  },

  init(this: SpInstance) {
    if (this.config.mode !== "hover") return;
    const trigger = resolveTrigger(this);
    if (!trigger) return;

    const show = () => {
      clearTimeout(this._hoverT as ReturnType<typeof setTimeout>);
      this._hoverT = setTimeout(() => this.show({ trigger }), 60);
    };
    this.on(trigger, "pointerenter", show);
    this.on(trigger, "focusin", () => {
      // A menu-item trigger gets focus during plain arrow navigation; its
      // submenu opens with ArrowRight/Enter instead (APG menu pattern).
      if (trigger.matches('[role^="menuitem"]')) return;
      show();
    });

    // On touch, a tap also fires a click that would toggle us shut; flag it so
    // ClickToShow swallows that click.
    this.on(trigger, "pointerdown", (e) => {
      this._preventClick = (e as PointerEvent).pointerType === "touch" ? true : null;
    });
  },
};
