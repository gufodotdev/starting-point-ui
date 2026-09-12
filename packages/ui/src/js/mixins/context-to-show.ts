// Right click (or a long press on touch) on the trigger area opens the panel
// at the pointer. Wired only when mode:context; a keyboard-invoked contextmenu
// event (Shift+F10, the Menu key) opens it too, anchored to the area.

import type { Mixin, SpInstance } from "../define";
import { ensureId, isDisabled, resolveTrigger } from "../utils";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

export const ContextToShow: Mixin = {
  props: { toggle: String, mode: { type: String, default: "click" } },

  init(this: SpInstance) {
    if (this.config.mode !== "context") return;
    const trigger = resolveTrigger(this);
    if (!trigger) return;
    trigger.setAttribute("aria-controls", ensureId(this.el));
    // Focusable so a pointer-opened menu takes the keyboard straight away.
    if (!this.el.hasAttribute("tabindex")) this.el.tabIndex = -1;

    const openAt = (x: number, y: number, size: number) => {
      this._anchor = {
        contextElement: trigger,
        getBoundingClientRect: () => DOMRect.fromRect({ x, y, width: size, height: size }),
      };
      if (this._isMounted() && !this.el.classList.contains("hide")) {
        this._position();
        return;
      }
      this.show({ trigger });
    };

    // Opened without a pointer (keyboard, script, a preview): anchor to the
    // middle of the area.
    this.on(this.el, "sp-beforeshow", (e) => {
      if (e.target !== this.el || this._anchor) return;
      this._anchor = {
        contextElement: trigger,
        getBoundingClientRect: () => {
          const r = trigger.getBoundingClientRect();
          return DOMRect.fromRect({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        },
      };
    });

    // Browsers disagree on the coordinates of a keyboard-invoked contextmenu
    // event, so a keyboard open is recognized by the absence of a recent press.
    let pressedAt = 0;
    this.on(trigger, "pointerdown", (e) => {
      pressedAt = Date.now();
      // The area is exempt from outside-press dismissal, so a plain press on
      // it closes the menu here.
      if ((e as PointerEvent).button === 0 && this._isMounted()) this.hide();
    });
    this.on(trigger, "contextmenu", (e) => {
      if (isDisabled(trigger)) return;
      e.preventDefault();
      if (Date.now() - pressedAt > 1000) {
        this.show({ trigger });
        this.el.querySelector<HTMLElement>(`${this.config.item}:not([aria-disabled="true"])`)?.focus();
        return;
      }
      const { clientX, clientY } = e as MouseEvent;
      openAt(clientX, clientY, 0);
      this.el.focus();
    });
    this.on(this.el, "contextmenu", (e) => e.preventDefault());

    let press: { x: number; y: number; timer: ReturnType<typeof setTimeout> } | null = null;
    const cancel = () => {
      if (press) clearTimeout(press.timer);
      press = null;
    };
    this.on(trigger, "touchstart", (e) => {
      const touches = (e as TouchEvent).touches;
      cancel();
      if (touches.length !== 1 || isDisabled(trigger)) return;
      const { clientX: x, clientY: y } = touches[0];
      press = {
        x,
        y,
        timer: setTimeout(() => {
          openAt(x, y, MOVE_TOLERANCE);
          this.el.focus();
        }, LONG_PRESS_MS),
      };
    });
    this.on(trigger, "touchmove", (e) => {
      const touches = (e as TouchEvent).touches;
      if (!press) return;
      if (touches.length !== 1) return cancel();
      const { clientX, clientY } = touches[0];
      if (Math.abs(clientX - press.x) > MOVE_TOLERANCE || Math.abs(clientY - press.y) > MOVE_TOLERANCE) cancel();
    });
    this.on(trigger, "touchend", cancel);
    this.on(trigger, "touchcancel", cancel);

    this.on(this.el, "sp-hidden", (e) => {
      if (e.target === this.el) this._anchor = null;
    });
  },

  destroy(this: SpInstance) {
    this.trigger?.removeAttribute("aria-controls");
  },
};
