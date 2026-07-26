// Positions the element against its trigger with Floating UI, and an optional
// [data-sp-arrow] child. autoUpdate runs only while shown so listeners don't
// leak while closed.

import { computePosition, autoUpdate, offset, flip, shift, arrow, size } from "@floating-ui/dom";
import type { Placement, Middleware } from "@floating-ui/dom";
import type { Mixin, SpInstance } from "../define";

const ARROW_SIDE: Record<string, string> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// Mirrors the resolved placement so enter animations can slide from the
// trigger's side and zoom from the anchored edge (radix parity).
function applyOrigin(el: HTMLElement, placement: string): void {
  const [side, align] = placement.split("-");
  el.dataset.spSide = side;
  const edge = ARROW_SIDE[side];
  if (side === "top" || side === "bottom") {
    const x = align === "start" ? "left" : align === "end" ? "right" : "center";
    el.style.transformOrigin = `${x} ${edge}`;
  } else {
    const y = align === "start" ? "top" : align === "end" ? "bottom" : "center";
    el.style.transformOrigin = `${edge} ${y}`;
  }
}

export const Anchorable: Mixin = {
  props: {
    placement: { type: String, default: "bottom-start" },
    offset: { type: Number, default: 6 },
    matchWidth: { type: Boolean, default: false },
    static: { type: Boolean, default: false },
  },

  init(this: SpInstance) {
    // Static panels are positioned by author CSS; skip anchoring entirely
    // while keeping the rest of the component (toggle, dismiss, top layer).
    if (this.config.static) return;
    this.on(this.el, "sp-show", () => this._startAnchor());
    this.on(this.el, "sp-hidden", () => this._stopAnchor());
  },

  destroy(this: SpInstance) {
    this._stopAnchor();
  },

  methods: {
    _position(this: SpInstance): void {
      if (this.config.static || !this.trigger) return;
      if (this.config.matchWidth) this.el.style.width = `${this.trigger.offsetWidth}px`;
      const arrowEl = this.el.querySelector<HTMLElement>("[data-sp-arrow]");
      // Leave room for the arrow's protrusion on top of the configured gap so
      // the panel isn't flush against the trigger.
      const gap = (this.config.offset as number) + (arrowEl ? arrowEl.offsetWidth / 2 : 0);
      const middleware: Middleware[] = [
        offset(gap),
        flip({ crossAxis: true, fallbackAxisSideDirection: "start" }),
        shift({ padding: 8 }),
        // Exposes the space left in the viewport so panels can cap their
        // height and scroll instead of getting clipped (radix parity).
        size({
          padding: 8,
          apply({ availableHeight, elements }) {
            elements.floating.style.setProperty(
              "--sp-available-height",
              `${Math.max(0, Math.floor(availableHeight))}px`,
            );
          },
        }),
      ];
      if (arrowEl) middleware.push(arrow({ element: arrowEl, padding: 4 }));

      // Applied synchronously from the configured placement so the enter
      // animation starts with the right origin; corrected below if flipped.
      applyOrigin(this.el, this.config.placement as string);

      computePosition(this.trigger, this.el, {
        strategy: "fixed",
        placement: this.config.placement as Placement,
        middleware,
      }).then(({ x, y, placement, middlewareData }) => {
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
        applyOrigin(this.el, placement);

        if (arrowEl && middlewareData.arrow) {
          const { x: ax, y: ay } = middlewareData.arrow;
          const side = ARROW_SIDE[placement.split("-")[0]];
          Object.assign(arrowEl.style, {
            left: ax != null ? `${ax}px` : "",
            top: ay != null ? `${ay}px` : "",
            [side]: `-${arrowEl.offsetWidth / 2}px`,
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
