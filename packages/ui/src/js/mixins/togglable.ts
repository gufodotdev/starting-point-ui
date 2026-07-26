// Show/hide lifecycle: drives the state classes and events; the mechanism
// (_mount/_unmount/_isMounted) is supplied by the composed component.
//
// Classes .show (entering) -> .shown (settled) -> .hide (leaving). Animation
// lives on the transient classes, so authoring .shown skips the enter animation.
// Events per phase: beforeshow -> show -> shown / beforehide -> hide -> hidden.

import type { Mixin, OpenOptions, SpInstance } from "../define";
import { waitForAnimations } from "../utils";

export const Togglable: Mixin = {
  // Markup shipped with .shown: settle the lifecycle without the enter animation.
  ready(this: SpInstance) {
    if (this._isShown() && !this._isMounted()) {
      this.show({ animate: false });
    }
  },

  methods: {
    _isShown(this: SpInstance): boolean {
      return this.el.classList.contains("shown");
    },

    show(this: SpInstance, { animate = true, trigger = null }: OpenOptions = {}): void {
      if (this._isShown() && this._isMounted()) return;
      if (this.el.classList.contains("show")) return;
      if (!this.emit("beforeshow")) return;

      if (trigger) this.trigger = trigger;
      this._mount();
      this.el.classList.remove("hide");

      if (!animate) {
        this.el.classList.add("shown");
        this.emit("show");
        this.emit("shown");
        return;
      }

      this.el.classList.add("show");
      this.emit("show");
      this._afterTransition(() => {
        this.el.classList.replace("show", "shown");
        this.emit("shown");
      });
    },

    hide(this: SpInstance): void {
      if (!this._isShown() && !this.el.classList.contains("show")) return;
      if (!this.emit("beforehide")) return;

      this.el.classList.remove("shown", "show");
      this.el.classList.add("hide");
      this.emit("hide");

      this._afterTransition(() => {
        this.el.classList.remove("hide");
        this._unmount();
        this.emit("hidden");
      });
    },

    toggle(this: SpInstance, opts?: OpenOptions): void {
      if (this._isShown()) this.hide();
      else this.show(opts);
    },

    // getAnimations covers transitions + keyframes and resolves immediately when
    // there's none. The token cancels the callback if an interrupting toggle wins.
    _afterTransition(this: SpInstance, fn: () => void): void {
      const token = {};
      this._token = token;
      requestAnimationFrame(() => {
        if (this._token !== token) return;
        waitForAnimations([this.el]).then(() => {
          if (this._token === token) fn();
        });
      });
    },
  },
};
