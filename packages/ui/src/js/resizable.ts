// A row or column of panels split by drag handles. Sizes are percentages of
// the space left after the handles, applied as flex-grow, so the browser lays
// out the split; the group only decides the numbers.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId } from "./utils";

type Panel = {
  el: HTMLElement;
  size: number;
  saved: number;
  collapsed: boolean;
};

const STEP = 5;
const STORAGE_PREFIX = "sp-resizable:";

function option(el: HTMLElement, name: string): string | null {
  return el.getAttribute(`data-sp-${name}`);
}

// A size in %, px, em, rem, vh or vw (bare numbers are percentages) as a
// percentage of the axis. Lengths need a measured axis to resolve.
function toPercent(
  value: string | null,
  axis: number,
  el: HTMLElement,
): number | undefined {
  if (value === null || value === "") return undefined;
  const m = value.trim().match(/^(-?\d*\.?\d+)(%|px|r?em|vh|vw)?$/);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (m[2] === undefined || m[2] === "%") return n;
  if (axis <= 0) return undefined;
  const px = {
    px: n,
    em: n * parseFloat(getComputedStyle(el).fontSize),
    rem: n * parseFloat(getComputedStyle(document.documentElement).fontSize),
    vh: (n * window.innerHeight) / 100,
    vw: (n * window.innerWidth) / 100,
  }[m[2]];
  return px === undefined ? undefined : (px / axis) * 100;
}

const round = (n: number) => Math.round(n * 100) / 100;

export const Resizable = define({
  name: "resizable",
  selector: ".resizable",

  props: {
    persist: String,
    disabled: { type: Boolean, default: false },
  },

  init(this: SpInstance) {
    this._vertical = this.el.classList.contains("resizable-vertical");
    this._panels = [
      ...this.el.querySelectorAll<HTMLElement>(":scope > .resizable-panel"),
    ].map((el): Panel => ({ el, size: 0, saved: 0, collapsed: false }));
    this._handles = [
      ...this.el.querySelectorAll<HTMLElement>(":scope > .resizable-handle"),
    ];
    if (this._panels.length < 2) return;

    for (const handle of this._handles as HTMLElement[]) {
      handle.setAttribute("role", "separator");
      handle.setAttribute(
        "aria-orientation",
        this._vertical ? "horizontal" : "vertical",
      );
      const before = this._before(handle);
      if (before) handle.setAttribute("aria-controls", ensureId(before.el));
      const disabled = this._handleDisabled(handle);
      handle.tabIndex = disabled ? -1 : 0;
      if (disabled) handle.setAttribute("aria-disabled", "true");
      this.on(handle, "pointerdown", (e) =>
        this._onPointerDown(e as PointerEvent, handle));
      this.on(handle, "keydown", (e) =>
        this._onKeydown(e as KeyboardEvent, handle));
      this.on(handle, "dblclick", () => this._onDoubleClick(handle));
    }

    // A group that is not laid out yet (hidden, or in a closed tab) can't
    // resolve pixel sizes; the first measured size lays it out instead.
    this._lastAxis = 0;
    const axis = this._axis();
    if (axis > 0) {
      this._lastAxis = axis;
      this._layout(this._initialLayout(axis));
    }
    this._observer = new ResizeObserver(() => {
      const next = this._axis();
      if (next <= 0) return;
      const prev = this._lastAxis as number;
      this._lastAxis = next;
      this._layout(
        prev
          ? this._preserve(this._sizes(), prev, next)
          : this._initialLayout(next),
      );
    });
    this._observer.observe(this.el);
  },

  destroy(this: SpInstance) {
    (this._observer as ResizeObserver | undefined)?.disconnect();
  },

  methods: {
    // The space the panels share, along the group's direction.
    _axis(this: SpInstance): number {
      const rect = this.el.getBoundingClientRect();
      const handles = (this._handles as HTMLElement[]).reduce((sum, h) => {
        const r = h.getBoundingClientRect();
        return sum + (this._vertical ? r.height : r.width);
      }, 0);
      return (this._vertical ? rect.height : rect.width) - handles;
    },

    _sizes(this: SpInstance): number[] {
      return (this._panels as Panel[]).map((p) => p.size);
    },

    _pct(panel: Panel, name: string, fallback: number, axis: number): number {
      return toPercent(option(panel.el, name), axis, panel.el) ?? fallback;
    },
    _min(this: SpInstance, panel: Panel, axis: number): number {
      return this._pct(panel, "min", 0, axis);
    },
    _max(this: SpInstance, panel: Panel, axis: number): number {
      return this._pct(panel, "max", 100, axis);
    },
    _collapsedSize(this: SpInstance, panel: Panel, axis: number): number {
      return this._pct(panel, "collapsed-size", 0, axis);
    },
    _collapsible(panel: Panel): boolean {
      return panel.el.hasAttribute("data-sp-collapsible");
    },
    _panelDisabled(panel: Panel): boolean {
      return panel.el.hasAttribute("data-sp-disabled");
    },

    _before(this: SpInstance, handle: HTMLElement): Panel | undefined {
      let el = handle.previousElementSibling;
      while (el && !el.classList.contains("resizable-panel"))
        el = el.previousElementSibling;
      return (this._panels as Panel[]).find((p) => p.el === el);
    },
    _after(this: SpInstance, handle: HTMLElement): Panel | undefined {
      let el = handle.nextElementSibling;
      while (el && !el.classList.contains("resizable-panel"))
        el = el.nextElementSibling;
      return (this._panels as Panel[]).find((p) => p.el === el);
    },

    _handleDisabled(this: SpInstance, handle: HTMLElement): boolean {
      if (this.config.disabled) return true;
      const before = this._before(handle);
      const after = this._after(handle);
      return (
        !before ||
        !after ||
        this._panelDisabled(before) ||
        this._panelDisabled(after)
      );
    },

    _initialLayout(this: SpInstance, axis: number): number[] {
      const stored = this._stored();
      if (stored) return stored;
      const sizes = (this._panels as Panel[]).map((p) =>
        this._pct(p, "size", NaN, axis));
      const known = sizes
        .filter((s) => !Number.isNaN(s))
        .reduce((a, b) => a + b, 0);
      const open = sizes.filter((s) => Number.isNaN(s)).length;
      // Panels without a size share what the sized ones leave; if every panel
      // is sized, the whole layout scales to fill the group.
      const share = open ? Math.max(0, 100 - known) / open : 0;
      const filled = sizes.map((s) => (Number.isNaN(s) ? share : s));
      const total = filled.reduce((a, b) => a + b, 0) || 1;
      return filled.map((s) => (s / total) * 100);
    },

    _stored(this: SpInstance): number[] | null {
      const key = this.config.persist as string | undefined;
      if (!key) return null;
      try {
        const sizes = JSON.parse(
          localStorage.getItem(STORAGE_PREFIX + key) ?? "null",
        ) as unknown;
        const valid =
          Array.isArray(sizes) &&
          sizes.length === (this._panels as Panel[]).length &&
          sizes.every((s) => typeof s === "number");
        return valid ? (sizes as number[]) : null;
      } catch {
        return null;
      }
    },

    _store(this: SpInstance): void {
      const key = this.config.persist as string | undefined;
      if (!key) return;
      try {
        localStorage.setItem(
          STORAGE_PREFIX + key,
          JSON.stringify(this.layout()),
        );
      } catch {
        return;
      }
    },

    // After the group changed size, panels marked to keep their pixel size
    // take it back and the others absorb the difference in proportion.
    _preserve(
      this: SpInstance,
      sizes: number[],
      prev: number,
      axis: number,
    ): number[] {
      if (prev === axis) return sizes;
      const fixed = (this._panels as Panel[]).map((p) =>
        p.el.hasAttribute("data-sp-preserve-pixels"));
      if (!fixed.some(Boolean) || fixed.every(Boolean)) return sizes;
      const next = sizes.map((s, i) => (fixed[i] ? (s * prev) / axis : s));
      const fixedTotal = next.reduce(
        (sum, s, i) => sum + (fixed[i] ? s : 0),
        0,
      );
      const flexTotal =
        next.reduce((sum, s, i) => sum + (fixed[i] ? 0 : s), 0) || 1;
      return next.map((s, i) =>
        fixed[i] ? s : (s / flexTotal) * Math.max(0, 100 - fixedTotal));
    },

    _layout(this: SpInstance, sizes: number[]): void {
      const panels = this._panels as Panel[];
      const axis = this._axis();
      let changed = false;
      panels.forEach((panel, i) => {
        const collapsedSize = this._collapsedSize(panel, axis);
        const collapsed =
          this._collapsible(panel) && sizes[i] <= collapsedSize + 0.001;
        const size = collapsed
          ? collapsedSize
          : Math.min(
              this._max(panel, axis),
              Math.max(this._min(panel, axis), sizes[i]),
            );
        if (!collapsed && size > collapsedSize) panel.saved = size;
        if (collapsed !== panel.collapsed) {
          panel.collapsed = collapsed;
          panel.el.classList.toggle("collapsed", collapsed);
          this.emit(collapsed ? "collapse" : "expand", {
            panel: panel.el,
            index: i,
          });
        }
        if (size !== panel.size) changed = true;
        panel.size = size;
        panel.el.style.flex = `${size} 1 0px`;
      });
      for (const handle of this._handles as HTMLElement[]) {
        const before = this._before(handle);
        if (!before) continue;
        handle.setAttribute(
          "aria-valuemin",
          String(Math.round(this._min(before, axis))),
        );
        handle.setAttribute(
          "aria-valuemax",
          String(Math.round(this._max(before, axis))),
        );
        handle.setAttribute("aria-valuenow", String(Math.round(before.size)));
      }
      if (changed) this.emit("resize", { layout: this.layout() });
    },

    // A collapsible neighbor snaps shut or open past the halfway point between
    // its collapsed and minimum sizes.
    _move(
      this: SpInstance,
      handle: HTMLElement,
      delta: number,
      from: number[],
    ): boolean {
      const panels = this._panels as Panel[];
      const before = this._before(handle);
      const after = this._after(handle);
      if (!before || !after || this._handleDisabled(handle)) return false;
      const axis = this._axis();
      const i = panels.indexOf(before);
      const j = panels.indexOf(after);
      const total = from[i] + from[j];
      const settle = (panel: Panel, wanted: number, other: Panel): number => {
        const min = this._min(panel, axis);
        const otherMin = this._collapsible(other)
          ? this._collapsedSize(other, axis)
          : this._min(other, axis);
        const max = Math.min(this._max(panel, axis), total - otherMin);
        if (this._collapsible(panel) && wanted < min) {
          const collapsedSize = this._collapsedSize(panel, axis);
          return wanted < (min + collapsedSize) / 2 ? collapsedSize : min;
        }
        return Math.min(max, Math.max(min, wanted));
      };
      const b = settle(
        after,
        total - settle(before, from[i] + delta, after),
        before,
      );
      const a = total - b;
      if (a === from[i] && b === from[j]) return false;
      const next = [...from];
      next[i] = a;
      next[j] = b;
      this._layout(next);
      return true;
    },

    _onPointerDown(
      this: SpInstance,
      e: PointerEvent,
      handle: HTMLElement,
    ): void {
      if (e.button !== 0 || this._handleDisabled(handle)) return;
      e.preventDefault();
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        // A synthetic pointer has no id to capture; the listeners below still work.
      }
      handle.classList.add("dragging");
      const start = { x: e.clientX, y: e.clientY, sizes: this._sizes() };
      const rtl = getComputedStyle(this.el).direction === "rtl";
      document.body.style.cursor = this._vertical ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
      const move = (ev: Event) => {
        const p = ev as PointerEvent;
        const px = this._vertical
          ? p.clientY - start.y
          : (p.clientX - start.x) * (rtl ? -1 : 1);
        this._move(handle, (px / this._axis()) * 100, start.sizes);
      };
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        handle.classList.remove("dragging");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        this._settled();
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    },

    _onKeydown(this: SpInstance, e: KeyboardEvent, handle: HTMLElement): void {
      const handles = this._handles as HTMLElement[];
      const rtl = getComputedStyle(this.el).direction === "rtl";
      let delta = 0;
      switch (e.key) {
        case "ArrowLeft":
          delta = this._vertical ? 0 : rtl ? STEP : -STEP;
          break;
        case "ArrowRight":
          delta = this._vertical ? 0 : rtl ? -STEP : STEP;
          break;
        case "ArrowUp":
          delta = this._vertical ? -STEP : 0;
          break;
        case "ArrowDown":
          delta = this._vertical ? STEP : 0;
          break;
        case "Home":
          delta = -100;
          break;
        case "End":
          delta = 100;
          break;
        case "Enter": {
          e.preventDefault();
          const before = this._before(handle);
          const after = this._after(handle);
          const target =
            before && this._collapsible(before)
              ? before
              : after && this._collapsible(after)
                ? after
                : null;
          if (target) this[target.collapsed ? "expand" : "collapse"](target.el);
          return;
        }
        case "F6": {
          e.preventDefault();
          const i = handles.indexOf(handle);
          const next = e.shiftKey
            ? i > 0
              ? i - 1
              : handles.length - 1
            : i + 1 < handles.length
              ? i + 1
              : 0;
          handles[next].focus({ preventScroll: true });
          return;
        }
        default:
          return;
      }
      e.preventDefault();
      if (delta && this._move(handle, delta, this._sizes())) this._settled();
    },

    _onDoubleClick(this: SpInstance, handle: HTMLElement): void {
      for (const panel of [this._before(handle), this._after(handle)]) {
        const size = panel && option(panel.el, "size");
        if (!panel || size === null) continue;
        this.resize(panel.el, size);
        return;
      }
    },

    _settled(this: SpInstance): void {
      this._store();
      this.emit("resized", { layout: this.layout() });
    },

    _panel(this: SpInstance, panel: number | HTMLElement): Panel | undefined {
      const panels = this._panels as Panel[];
      return typeof panel === "number"
        ? panels[panel]
        : panels.find((p) => p.el === panel);
    },

    layout(this: SpInstance): number[] {
      return this._sizes().map(round);
    },

    setLayout(this: SpInstance, sizes: number[]): void {
      const total = sizes.reduce((a, b) => a + b, 0) || 1;
      this._layout(sizes.map((s) => (s / total) * 100));
      this._settled();
    },

    // Give one panel a size in any unit; its next sibling takes the
    // difference, or the previous one when it is last.
    resize(
      this: SpInstance,
      panel: number | HTMLElement,
      size: number | string,
    ): void {
      const panels = this._panels as Panel[];
      const target = this._panel(panel);
      if (!target) return;
      const i = panels.indexOf(target);
      const j = i + 1 < panels.length ? i + 1 : i - 1;
      const wanted = toPercent(String(size), this._axis(), target.el);
      if (wanted === undefined || j < 0) return;
      const sizes = this._sizes();
      const total = sizes[i] + sizes[j];
      sizes[i] = Math.min(total, Math.max(0, wanted));
      sizes[j] = total - sizes[i];
      this._layout(sizes);
      this._settled();
    },

    collapse(this: SpInstance, panel: number | HTMLElement): void {
      const target = this._panel(panel);
      if (!target || !this._collapsible(target) || target.collapsed) return;
      this.resize(target.el, this._collapsedSize(target, this._axis()));
    },

    expand(this: SpInstance, panel: number | HTMLElement): void {
      const target = this._panel(panel);
      if (!target || !target.collapsed) return;
      this.resize(
        target.el,
        Math.max(target.saved, this._min(target, this._axis())),
      );
    },

    isCollapsed(this: SpInstance, panel: number | HTMLElement): boolean {
      return this._panel(panel)?.collapsed ?? false;
    },
  },
});
