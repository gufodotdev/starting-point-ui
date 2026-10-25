// The bar: its scrolled state, current link and arrow keys between top-level
// items.

import { define } from "./define";
import type { SpInstance } from "./define";
import { announceCurrent, belowBreakpoint, isDisabled } from "./utils";

// Elements shown in the bar itself, rather than inside a panel or the drawer.
function barPieces(el: Element): Element[] {
  return [...el.children].flatMap((child) => {
    if (child.matches(".navbar-content")) return [];
    if (child.matches(".navbar-collapse") && belowBreakpoint("--breakpoint-navbar")) return [];
    if (child.matches(".navbar-collapse") || child.querySelector(".navbar-content, .navbar-collapse")) return barPieces(child);
    return [child];
  });
}

export const Navbar = define({
  name: "navbar",
  selector: ".navbar",

  init(this: SpInstance) {
    this._current = announceCurrent(this.el, ".navbar-link");

    this.on(this.el, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key !== "ArrowLeft" && key !== "ArrowRight") return;
      const item = (e.target as Element).closest(".navbar-nav > .navbar-link");
      if (!item || (item.closest(".navbar-collapse") && belowBreakpoint("--breakpoint-navbar"))) return;
      const items = [...item.parentElement!.querySelectorAll<HTMLElement>(":scope > .navbar-link")].filter((el) => !isDisabled(el));
      const rtl = getComputedStyle(item).direction === "rtl";
      const step = (key === "ArrowRight") !== rtl ? 1 : -1;
      const next = items[items.indexOf(item as HTMLElement) + step];
      e.preventDefault();
      next?.focus();
    });

    // Moves an overlay's .dark onto its visible pieces until scrolled, so
    // panels and the drawer keep the page theme.
    if (this.el.matches(".navbar-overlay.dark")) {
      this.el.classList.remove("dark");
      this._themed = [];
      this._theme = () => {
        for (const el of this._themed as Element[]) el.classList.remove("dark");
        this._themed = this.el.classList.contains("scrolled") ? [] : barPieces(this.el);
        for (const el of this._themed as Element[]) el.classList.add("dark");
      };
      this._theme();
      this.on(window, "resize", () => this._theme());
    }

    const position = getComputedStyle(this.el).position;
    if (position !== "sticky" && position !== "fixed") return;

    // The bar never leaves the viewport, so a sentinel at its place in the flow
    // is watched instead.
    const sentinel = document.createElement("span");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;width:1px;height:1px;visibility:hidden;pointer-events:none";
    this.el.before(sentinel);
    this._sentinel = sentinel;
    this._observer = new IntersectionObserver(([entry]) => {
      this.el.classList.toggle("scrolled", !entry.isIntersecting);
      this._theme?.();
    });
    this._observer.observe(sentinel);
  },

  destroy(this: SpInstance) {
    this._current?.disconnect();
    this._observer?.disconnect();
    this._sentinel?.remove();
    if (this._themed) {
      for (const el of this._themed as Element[]) el.classList.remove("dark");
      this.el.classList.add("dark");
    }
  },
});
