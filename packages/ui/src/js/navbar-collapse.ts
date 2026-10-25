// The navbar's responsive wrapper: transparent in the bar, a drawer below the
// breakpoint.

import { define } from "./define";
import type { OpenOptions, SpInstance } from "./define";
import { belowBreakpoint, ensureId, resolveTrigger } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Navigable } from "./mixins/navigable";

const CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

export const NavbarCollapse = define({
  name: "navbar-collapse",
  selector: ".navbar-collapse",
  mixins: [Togglable, ClickToShow, ClickOutsideHide, Escapable, Navigable],

  props: {
    item: { type: String, default: ".navbar-nav > .navbar-link, .navbar-content:is(.show, .shown) .navbar-link" },
  },

  init(this: SpInstance) {
    const trigger = resolveTrigger(this);
    trigger?.setAttribute("aria-haspopup", "dialog");
    if (trigger && !this.el.hasAttribute("aria-label") && !this.el.hasAttribute("aria-labelledby")) {
      this.el.setAttribute("aria-labelledby", ensureId(trigger));
    }

    if (!this.el.querySelector(":scope > .navbar-collapse-header")) {
      const header = document.createElement("div");
      header.className = "navbar-collapse-header";
      const brand = this.el.closest(".navbar")?.querySelector(".brand")?.cloneNode(true) as HTMLElement | undefined;
      if (brand) {
        for (const el of [brand, ...brand.querySelectorAll("[id]")]) el.removeAttribute("id");
        for (const el of [brand, ...brand.querySelectorAll(".dark")]) el.classList.remove("dark");
        header.append(brand);
      }
      const close = document.createElement("button");
      close.type = "button";
      close.className = "btn btn-ghost btn-icon navbar-close";
      close.setAttribute("aria-label", "Close");
      close.innerHTML = CLOSE;
      this.on(close, "click", () => this.hide());
      header.append(close);
      this.el.prepend(header);
    }

    this.on(this.el, "sp-show", (e) => {
      if (e.target !== this.el) return;
      this.el.setAttribute("role", "dialog");
      this.el.setAttribute("aria-modal", "true");
    });
    // Unless the arrow keys that opened it already put focus on a row.
    this.on(this.el, "sp-shown", (e) => {
      if (e.target !== this.el || this.el.contains(document.activeElement)) return;
      (this.el.querySelector<HTMLElement>("a, button, [tabindex]") ?? this.el).focus();
    });
    this.on(this.el, "sp-hidden", (e) => {
      if (e.target !== this.el) return;
      this.el.removeAttribute("role");
      this.el.removeAttribute("aria-modal");
      this.trigger?.focus();
    });
    this.on(window, "resize", () => {
      if (this._isMounted() && !this._isMobile()) this.hide();
    });
    this.on(this.el, "click", (e) => {
      if ((e.target as Element).closest("a[href]")) this.hide();
    });
  },

  methods: {
    _isMobile(this: SpInstance): boolean {
      return belowBreakpoint("--breakpoint-navbar");
    },

    _keepsFocusOnOpen(): boolean {
      return true;
    },

    show(this: SpInstance, opts?: OpenOptions): void {
      if (!this._isMobile()) return;
      (Togglable.methods!.show as (this: SpInstance, opts?: OpenOptions) => void).call(this, opts);
    },

    // Mounted tracks data-sp-open (stable through the exit animation), not
    // :popover-open which flips the instant hidePopover() runs.
    _isMounted(this: SpInstance): boolean {
      return this.el.hasAttribute("data-sp-open");
    },
    _mount(this: SpInstance): void {
      const el = this.el as HTMLElement & { showPopover(): void };
      el.setAttribute("popover", "manual");
      if (!el.matches(":popover-open")) el.showPopover();
      el.setAttribute("data-sp-open", "");
    },
    _unmount(this: SpInstance): void {
      const el = this.el as HTMLElement & { hidePopover(): void };
      el.removeAttribute("data-sp-open");
      if (el.matches(":popover-open")) el.hidePopover();
      el.removeAttribute("popover");
    },
  },
});
