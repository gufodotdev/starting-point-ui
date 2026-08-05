// Modal <dialog> that slides in from a screen edge and follows the pointer:
// dragging toward the edge dismisses it, or settles on the nearest snap point
// when data-sp-snap-points is set.

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";
import { linkAria } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Modalable } from "./mixins/modalable";
import { Dismissable } from "./mixins/dismissable";

const INTERACTIVE =
  'button, a[href], input, select, textarea, label, [contenteditable], [role="button"], [role="slider"], [data-sp-no-drag]';

const CLOSE_THRESHOLD = 0.25;
const VELOCITY_THRESHOLD = 0.4;
const STACK_PEEK = 16;
const STACK_STEP = 0.05;
const COMMIT_THRESHOLD = 8;

export const Drawer = define({
  name: "drawer",
  selector: ".drawer",
  mixins: [Togglable, ClickToShow, Modalable, Dismissable],

  props: {
    snapPoints: String,
  },

  init(this: SpInstance) {
    linkAria(this.el, ".drawer-title", "aria-labelledby");
    linkAria(this.el, ".drawer-description", "aria-describedby");

    const panel = this.el.querySelector<HTMLElement>(".drawer-panel");
    if (!panel) return;
    this._panel = panel;

    this._snaps = String(this.config.snapPoints ?? "")
      .split(",")
      .map((s: string) => parseFloat(s))
      .filter((n: number) => n > 0 && n <= 1)
      .sort((a: number, b: number) => a - b);
    this._activeSnap = 0;

    this.on(this.el, "sp-show", (e) => {
      if (e.target !== this.el) return;
      this._enter();
    });
    this.on(this.el, "sp-hide", (e) => {
      if (e.target !== this.el) return;
      this._restoreStack();
    });
    this.on(this.el, "sp-hidden", (e) => {
      if (e.target !== this.el) return;
      this._resetDrag();
      this._restoreStack();
      this.el.classList.remove("drawer-nested");
    });

    // Crossing the breakpoint changes the axis; recompute for it.
    this.on(window, "resize", () => {
      if (!this._isShown() || this._dragging) return;
      if (this.el.classList.contains("drawer-stacked")) return;
      const snaps = this._snaps as number[];
      if (snaps.length) {
        this._applyTranslate(this._snapTranslate(snaps[this._activeSnap as number]));
      }
      const chain = (this._stackChain as HTMLElement[] | null) ?? [];
      const size = this._size();
      chain.forEach((el, i) => {
        getInstance(el, Drawer)?._applyStack(i + 1, size);
      });
    });

    this.on(panel, "pointerdown", (e) => this._dragStart(e as PointerEvent));
    this.on(panel, "pointermove", (e) => this._dragMove(e as PointerEvent));
    this.on(panel, "pointerup", (e) => this._dragEnd(e as PointerEvent));
    this.on(panel, "pointercancel", () => this._dragCancel());
  },

  methods: {
    // Physical closing direction, resolved per gesture so runtime direction
    // changes keep start/end correct.
    _direction(this: SpInstance): { axis: "x" | "y"; sign: 1 | -1 } {
      const cls = this.el.classList;
      if (cls.contains("drawer-top")) return { axis: "y", sign: -1 };
      // Side drawers render as the bottom sheet below the drawer breakpoint.
      const bp = getComputedStyle(document.documentElement)
        .getPropertyValue("--breakpoint-drawer")
        .trim();
      const mobile = bp
        ? window.matchMedia(`(width < ${bp})`).matches
        : window.innerWidth < 640;
      if (mobile) return { axis: "y", sign: 1 };
      const rtl = getComputedStyle(this.el).direction === "rtl";
      if (cls.contains("drawer-left")) return { axis: "x", sign: -1 };
      if (cls.contains("drawer-right")) return { axis: "x", sign: 1 };
      if (cls.contains("drawer-start")) return { axis: "x", sign: rtl ? 1 : -1 };
      if (cls.contains("drawer-end")) return { axis: "x", sign: rtl ? -1 : 1 };
      return { axis: "y", sign: 1 };
    },

    _size(this: SpInstance): number {
      const panel = this._panel as HTMLElement;
      return this._direction().axis === "y" ? panel.offsetHeight : panel.offsetWidth;
    },

    // Dismissing must travel the panel plus its inset from the screen edge.
    _closedOffset(this: SpInstance): number {
      const { axis, sign } = this._direction();
      const side =
        axis === "y" ? (sign > 0 ? "bottom" : "top") : sign > 0 ? "right" : "left";
      const inset = parseFloat(getComputedStyle(this._panel as HTMLElement)[side]);
      return this._size() + (Number.isFinite(inset) ? Math.max(0, inset) : 0) + 2;
    },

    // Translate (px toward the closed position) for a snap fraction.
    _snapTranslate(this: SpInstance, fraction: number): number {
      return this._size() * (1 - fraction);
    },

    _applyTranslate(this: SpInstance, px: number): void {
      const { axis, sign } = this._direction();
      const panel = this._panel as HTMLElement;
      const value = px === 0 ? "" : `translate3d(${axis === "x" ? `${px * sign}px, 0` : `0, ${px * sign}px`}, 0)`;
      panel.style.transform = value;
    },

    _applyFade(this: SpInstance, translate: number): void {
      const size = this._size();
      const snaps = this._snaps as number[];
      const fadeFrom = snaps.length
        ? this._snapTranslate(snaps[snaps.length - 1])
        : 0;
      const range = size - fadeFrom;
      const past = Math.max(0, translate - fadeFrom);
      const fade = range > 0 ? Math.min(1, Math.max(0, 1 - past / range)) : 1;
      this.el.style.setProperty("--sp-drawer-fade", String(fade));
    },

    // The enter animation slides into whatever transform is set here.
    _enter(this: SpInstance): void {
      const snaps = this._snaps as number[];
      if (snaps.length) {
        this._activeSnap = 0;
        const translate = this._snapTranslate(snaps[0]);
        this._applyTranslate(translate);
        this._applyFade(translate);
      }
      const parent = this.trigger?.closest(".drawer[open]") as HTMLElement | null;
      const chain: HTMLElement[] =
        parent && parent !== this.el
          ? [parent, ...((getInstance(parent, Drawer)?._stackChain as HTMLElement[]) ?? [])]
          : [];
      this._stackChain = chain;
      this.el.classList.toggle("drawer-nested", chain.length > 0);
      // Every drawer in the stack matches the frontmost height, so the fan
      // reads as even strips behind it.
      const size = this._size();
      chain.forEach((el, i) => {
        getInstance(el, Drawer)?._applyStack(i + 1, size);
      });
    },

    // Behind `depth` drawers: shifted one peek strip per level and scaled
    // back; a vertical parent matches its child's height.
    _applyStack(this: SpInstance, depth: number, childSize: number | null): void {
      const { axis, sign } = this._direction();
      const panel = this._panel as HTMLElement;
      this.el.classList.add("drawer-stacked");
      panel.style.transformOrigin =
        axis === "y" ? (sign > 0 ? "bottom" : "top") : sign > 0 ? "right" : "left";
      if (axis === "y" && childSize != null) {
        panel.style.height = `${childSize}px`;
      } else if (axis === "x") {
        panel.style.height = "";
      }
      // The shrink term cancels the edge-origin scale shift, leaving exactly
      // one peek strip per stacked level.
      const scale = Math.max(0, 1 - STACK_STEP * depth);
      const size =
        axis === "y" && childSize != null ? childSize : this._size();
      const shift = -sign * (STACK_PEEK * depth + (1 - scale) * size);
      const translate =
        axis === "y" ? `translate3d(0, ${shift}px, 0)` : `translate3d(${shift}px, 0, 0)`;
      panel.style.transform = `${translate} scale(${scale})`;
    },

    _unstack(this: SpInstance): void {
      const panel = this._panel as HTMLElement;
      this.el.classList.remove("drawer-stacked");
      panel.style.height = "";
      panel.style.width = "";
      panel.style.transformOrigin = "";
      const snaps = this._snaps as number[];
      if (snaps.length && this._isShown()) {
        this._applyTranslate(this._snapTranslate(snaps[this._activeSnap as number]));
      } else {
        panel.style.transform = "";
      }
    },

    // Closing: the chain moves up one place, resized to the promoted
    // drawer's natural height.
    _restoreStack(this: SpInstance): void {
      const chain = (this._stackChain as HTMLElement[] | null) ?? [];
      this._stackChain = null;
      chain[0]?.classList.remove("drawer-revealing");
      const front = chain[0] ? getInstance(chain[0], Drawer) : null;
      let frontSize: number | null = null;
      if (front && front._direction().axis === "y") {
        const panel = front._panel as HTMLElement;
        const cap = parseFloat(getComputedStyle(panel).maxHeight);
        frontSize = Math.min(
          panel.scrollHeight,
          Number.isFinite(cap) ? cap : Infinity,
        );
      }
      chain.forEach((el, i) => {
        const inst = getInstance(el, Drawer);
        if (!inst) return;
        (inst._panel as HTMLElement).style.transition = "";
        if (i === 0) inst._unstack();
        else inst._applyStack(i, frontSize);
      });
    },

    // A canceled drag: the chain settles back to its resting stack.
    _restack(this: SpInstance): void {
      const chain = (this._stackChain as HTMLElement[] | null) ?? [];
      chain[0]?.classList.remove("drawer-revealing");
      chain.forEach((el, i) => {
        const inst = getInstance(el, Drawer);
        if (!inst) return;
        (inst._panel as HTMLElement).style.transition = "";
        inst._applyStack(i + 1, null);
      });
    },

    _dragStart(this: SpInstance, e: PointerEvent): void {
      if (!this._isShown() || this.el.classList.contains("dragged")) return;
      const target = e.target as HTMLElement;
      // On touch, movement decides tap vs drag; a mouse press on an
      // interactive element never drags.
      if (target.closest(INTERACTIVE) && e.pointerType !== "touch") return;

      // A scrolled drawer-content owns the gesture; drags only begin from
      // its resting edge.
      const { axis, sign } = this._direction();
      const scroller = target.closest(".drawer-content");
      if (scroller && axis === "y") {
        if (sign > 0 && scroller.scrollTop > 0) return;
        const max = scroller.scrollHeight - scroller.clientHeight;
        if (sign < 0 && scroller.scrollTop < max) return;
      }

      this._pending = true;
      this._pointerId = e.pointerId;
      this._startX = e.clientX;
      this._startY = e.clientY;
      this._samples = [{ t: e.timeStamp, pos: axis === "y" ? e.clientY : e.clientX }];
    },

    // Only now is the pointer captured, so a plain tap reaches its target.
    _commitDrag(this: SpInstance, e: PointerEvent): void {
      const { axis } = this._direction();
      const panel = this._panel as HTMLElement;
      try {
        panel.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic events have no active pointer to capture.
      }
      this._pending = false;
      this._dragging = true;
      document.getSelection()?.removeAllRanges();
      this._dragOrigin = axis === "y" ? e.clientY : e.clientX;
      this._dragBase = (this._snaps as number[]).length
        ? this._snapTranslate((this._snaps as number[])[this._activeSnap as number])
        : 0;
      panel.style.transition = "none";
      this.el.style.transition = "none";
      this.el.classList.add("dragging");

      // The stack follows the drag: kill its transitions, reveal the next
      // drawer's content.
      const chain = (this._stackChain as HTMLElement[] | null) ?? [];
      chain.forEach((el) => {
        const inst = getInstance(el, Drawer);
        if (inst) (inst._panel as HTMLElement).style.transition = "none";
      });
      chain[0]?.classList.add("drawer-revealing");
    },

    _dragMove(this: SpInstance, e: PointerEvent): void {
      if (this._pending && e.pointerId === this._pointerId) {
        const dx = e.clientX - (this._startX as number);
        const dy = e.clientY - (this._startY as number);
        const { axis } = this._direction();
        const main = axis === "y" ? dy : dx;
        const cross = axis === "y" ? dx : dy;
        if (Math.abs(main) < COMMIT_THRESHOLD) {
          if (Math.abs(cross) > COMMIT_THRESHOLD * 2) this._pending = false;
          return;
        }
        if (Math.abs(cross) > Math.abs(main)) {
          this._pending = false;
          return;
        }
        // A mouse that started on text is selecting by now; let it.
        if (e.pointerType !== "touch") {
          const selection = document.getSelection();
          if (selection && !selection.isCollapsed) {
            this._pending = false;
            return;
          }
        }
        this._commitDrag(e);
      }
      if (!this._dragging || e.pointerId !== this._pointerId) return;
      const { axis, sign } = this._direction();
      const pos = axis === "y" ? e.clientY : e.clientX;
      const delta = (pos - (this._dragOrigin as number)) * sign;
      let translate = (this._dragBase as number) + delta;
      if (translate < 0) translate *= 0.2;
      this._translate = translate;
      this._applyTranslate(translate);
      this._applyFade(translate);

      const chain = (this._stackChain as HTMLElement[] | null) ?? [];
      if (chain.length) {
        const progress = Math.min(1, Math.max(0, translate / this._size()));
        chain.forEach((el, i) => {
          getInstance(el, Drawer)?._applyStack(i + 1 - progress, null);
        });
      }

      const samples = this._samples as { t: number; pos: number }[];
      samples.push({ t: e.timeStamp, pos });
      if (samples.length > 5) samples.shift();
    },

    _velocity(this: SpInstance): number {
      const samples = this._samples as { t: number; pos: number }[];
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t;
      if (dt < 10) return 0;
      return ((last.pos - first.pos) * this._direction().sign) / dt;
    },

    _dragEnd(this: SpInstance, e: PointerEvent): void {
      if (this._pending && e.pointerId === this._pointerId) {
        this._pending = false;
        return;
      }
      if (!this._dragging || e.pointerId !== this._pointerId) return;
      this._dragging = false;
      const translate = (this._translate as number) ?? 0;
      const velocity = this._velocity();
      const size = this._size();
      const snaps = this._snaps as number[];

      if (snaps.length) {
        const candidates = snaps.map((f: number) => this._snapTranslate(f));
        candidates.push(this._closedOffset());
        const projected = translate + velocity * 100;
        let best = 0;
        for (let i = 1; i < candidates.length; i++) {
          if (Math.abs(candidates[i] - projected) < Math.abs(candidates[best] - projected)) {
            best = i;
          }
        }
        if (best === candidates.length - 1) {
          this._settleClose();
        } else {
          this._restack();
          this._activeSnap = best;
          this._settleTo(candidates[best]);
        }
        return;
      }

      if (velocity > VELOCITY_THRESHOLD || translate > size * CLOSE_THRESHOLD) {
        this._settleClose();
      } else {
        this._restack();
        this._settleTo(0);
      }
    },

    _dragCancel(this: SpInstance): void {
      this._pending = false;
      if (!this._dragging) return;
      this._dragging = false;
      this._restack();
      const snaps = this._snaps as number[];
      this._settleTo(
        snaps.length ? this._snapTranslate(snaps[this._activeSnap as number]) : 0,
      );
    },

    _settleTo(this: SpInstance, translate: number): void {
      const panel = this._panel as HTMLElement;
      panel.style.transition = "transform var(--drawer-duration, 0.5s) var(--drawer-ease, ease)";
      this.el.style.transition = "background-color var(--drawer-duration, 0.5s) var(--drawer-ease, ease)";
      this._applyTranslate(translate);
      this._applyFade(translate);
      this._afterSettle(() => {
        panel.style.transition = "";
        this.el.style.transition = "";
        this.el.classList.remove("dragging");
      });
    },

    _settleClose(this: SpInstance): void {
      const panel = this._panel as HTMLElement;
      this._restoreStack();
      this.el.classList.add("dragged");
      panel.style.transition = "transform var(--drawer-duration, 0.5s) var(--drawer-ease, ease)";
      this.el.style.transition = "background-color var(--drawer-duration, 0.5s) var(--drawer-ease, ease)";
      this._applyTranslate(this._closedOffset());
      this._applyFade(this._size());
      this._afterSettle(() => this.hide());
    },

    // A zero --drawer-duration never fires transitionend; run the callback
    // straight away so the settle can't strand the drawer.
    _afterSettle(this: SpInstance, fn: () => void): void {
      const panel = this._panel as HTMLElement;
      if (!parseFloat(getComputedStyle(panel).transitionDuration)) {
        fn();
        return;
      }
      const done = (event: TransitionEvent) => {
        if (event.propertyName !== "transform") return;
        panel.removeEventListener("transitionend", done);
        fn();
      };
      panel.addEventListener("transitionend", done);
    },

    _resetDrag(this: SpInstance): void {
      const panel = this._panel as HTMLElement;
      if (!panel) return;
      panel.style.transform = "";
      panel.style.transition = "";
      this.el.style.transition = "";
      this.el.style.removeProperty("--sp-drawer-fade");
      this.el.classList.remove("dragging", "dragged");
      this._dragging = false;
      this._pending = false;
      this._activeSnap = 0;
    },
  },
});
