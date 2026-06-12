// Positions the element against its trigger with Floating UI, and an optional
// [data-sp-arrow] child. autoUpdate runs only while shown so listeners don't
// leak while closed.

import { computePosition, autoUpdate, offset, flip, shift, arrow } from "@floating-ui/dom";
import type { Placement, Middleware } from "@floating-ui/dom";
import type { Mixin, SpInstance } from "../define";

const ARROW_SIDE: Record<string, string> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export const Anchorable: Mixin = {
  props: {
    placement: { type: String, default: "bottom-start" },
    offset: { type: Number, default: 6 },
    matchWidth: { type: Boolean, default: false },
  },

  init(this: SpInstance) {
    this.on(this.el, "sp-show", () => this._startAnchor());
    this.on(this.el, "sp-hidden", () => this._stopAnchor());
  },

  destroy(this: SpInstance) {
    this._stopAnchor();
  },

  methods: {
    _position(this: SpInstance): void {
      if (!this.trigger) return;
      if (this.config.matchWidth) this.el.style.width = `${this.trigger.offsetWidth}px`;
      const arrowEl = this.el.querySelector<HTMLElement>("[data-sp-arrow]");
      // Leave room for the arrow's protrusion on top of the configured gap so
      // the panel isn't flush against the trigger.
      const gap = (this.config.offset as number) + (arrowEl ? arrowEl.offsetWidth / 2 : 0);
      const middleware: Middleware[] = [
        offset(gap),
        flip({ crossAxis: true, fallbackAxisSideDirection: "start" }),
        shift({ padding: 8 }),
      ];
      if (arrowEl) middleware.push(arrow({ element: arrowEl, padding: 4 }));

      computePosition(this.trigger, this.el, {
        strategy: "fixed",
        placement: this.config.placement as Placement,
        middleware,
      }).then(({ x, y, placement, middlewareData }) => {
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;

        if (arrowEl && middlewareData.arrow) {
          const { x: ax, y: ay } = middlewareData.arrow;
          const side = ARROW_SIDE[placement.split("-")[0]];
          Object.assign(arrowEl.style, {
            left: ax != null ? `${ax}px` : "",
            top: ay != null ? `${ay}px` : "",
            [side]: "-4px",
          });
        }
      });
    },

    _startAnchor(this: SpInstance): void {
      if (!this.trigger) return;
      this._stopAnchor();
      this._stopAnchorFn = autoUpdate(this.trigger, this.el, () => this._position());
    },

    _stopAnchor(this: SpInstance): void {
      (this._stopAnchorFn as (() => void) | undefined)?.();
      this._stopAnchorFn = null;
      // Clear the resolved position so a reopen doesn't paint at the last spot
      // (stale after a scroll) before the fresh computePosition lands.
      this.el.style.left = "";
      this.el.style.top = "";
    },
  },
};
