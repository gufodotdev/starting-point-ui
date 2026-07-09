// Expand/collapse lifecycle: the in-flow disclosure dialect of Togglable
// (overlays show/hide, disclosure expands/collapses). Drives the state classes
// and events; the mechanism (_mount/_unmount/_isMounted) is supplied by the
// composed component.
//
// Classes .expanding (entering) -> .expanded (settled) -> .collapsing (leaving).
// Animation lives on the transient classes, so authoring .expanded skips the
// enter animation. Events per phase: beforeexpand -> expand -> expanded /
// beforecollapse -> collapse -> collapsed.

import type { Mixin, OpenOptions, SpInstance } from "../define";
import { Togglable } from "./togglable";

export const Expandable: Mixin = {
  // Markup shipped with .expanded: settle the lifecycle without the enter animation.
  ready(this: SpInstance) {
    if (this._isExpanded() && !this._isMounted()) {
      this.expand({ animate: false });
    }
  },

  methods: {
    _isExpanded(this: SpInstance): boolean {
      return this.el.classList.contains("expanded");
    },

    expand(this: SpInstance, { animate = true, trigger = null }: OpenOptions = {}): void {
      if (this._isExpanded() && this._isMounted()) return;
      if (this.el.classList.contains("expanding")) return;
      if (!this.emit("beforeexpand")) return;

      if (trigger) this.trigger = trigger;
      this._mount();
      this.el.classList.remove("collapsing");

      if (!animate) {
        this.el.classList.add("expanded");
        this.emit("expand");
        this.emit("expanded");
        return;
      }

      this.el.classList.add("expanding");
      this.emit("expand");
      this._afterTransition(() => {
        this.el.classList.replace("expanding", "expanded");
        this.emit("expanded");
      });
    },

    collapse(this: SpInstance): void {
      if (!this._isExpanded() && !this.el.classList.contains("expanding")) return;
      if (!this.emit("beforecollapse")) return;

      this.el.classList.remove("expanded", "expanding");
      this.el.classList.add("collapsing");
      this.emit("collapse");

      this._afterTransition(() => {
        this.el.classList.remove("collapsing");
        this._unmount();
        this.emit("collapsed");
      });
    },

    toggle(this: SpInstance, opts?: OpenOptions): void {
      if (this._isExpanded()) this.collapse();
      else this.expand(opts);
    },

    _afterTransition: Togglable.methods!._afterTransition!,
  },
};
