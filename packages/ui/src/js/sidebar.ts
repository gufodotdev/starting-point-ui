// App-shell panel: a backdrop drawer below the sidebar breakpoint, a
// collapsible in-flow column above it.

import { define } from "./define";
import type { OpenOptions, SpInstance } from "./define";
import { getInstance } from "./observer";
import { ensureId } from "./utils";
import { Tooltip } from "./tooltip";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Escapable } from "./mixins/escapable";

export const Sidebar = define({
  name: "sidebar",
  selector: "[data-sp-sidebar]",
  mixins: [Togglable, ClickToShow, Escapable],

  init(this: SpInstance) {
    // Authored on the panel so the collapse mode's first paint is correct
    // pre-JS; default here only fills it in for CSS that reads the attribute.
    if (!this.el.hasAttribute("data-collapse")) {
      this.el.setAttribute("data-collapse", "offcanvas");
    }

    const backdrop = this.el.closest(".sidebar")?.querySelector<HTMLElement>(".sidebar-backdrop");
    if (backdrop) {
      this.on(backdrop, "click", () => this.hide());
      // Ignore lifecycle events bubbling up from nested components (e.g. a
      // collapsible submenu); only the panel's own drive the backdrop.
      this.on(this.el, "sp-show", (e) => {
        if (e.target !== this.el) return;
        backdrop.classList.add("show");
      });
      this.on(this.el, "sp-shown", (e) => {
        if (e.target !== this.el) return;
        backdrop.classList.replace("show", "shown");
      });
      this.on(this.el, "sp-hide", (e) => {
        if (e.target !== this.el) return;
        backdrop.classList.remove("show", "shown");
        backdrop.classList.add("hide");
      });
      this.on(this.el, "sp-hidden", (e) => {
        if (e.target !== this.el) return;
        backdrop.classList.remove("hide");
      });
    }

    // The open drawer is a modal dialog: announce it as one and manage focus,
    // mirroring the dialog/sheet. These apply only on mobile (the desktop column
    // never fires the show/hide lifecycle).
    this.on(this.el, "sp-show", (e) => {
      if (e.target !== this.el) return;
      this.el.setAttribute("role", "dialog");
      this.el.setAttribute("aria-modal", "true");
    });
    this.on(this.el, "sp-shown", (e) => {
      if (e.target !== this.el) return;
      (this.el.querySelector<HTMLElement>("a, button, [tabindex]") ?? this.el).focus();
    });
    this.on(this.el, "sp-hidden", (e) => {
      if (e.target !== this.el) return;
      this.el.removeAttribute("role");
      this.el.removeAttribute("aria-modal");
      this.trigger?.focus();
    });

    // Resizing up to desktop discards an open drawer.
    this.on(window, "resize", () => {
      if (!this._isMobile() && this._isMounted()) this.hide();
      this._syncAria();
    });

    if (this.el.getAttribute("data-collapse") === "icon") this._buildTooltips();

    this._syncAria();
  },

  methods: {
    _isMobile(this: SpInstance): boolean {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        "--breakpoint-sidebar",
      );
      return window.innerWidth < (parseInt(value, 10) || 1024);
    },

    // "Expanded" is the drawer on mobile, the un-collapsed column on desktop.
    _syncAria(this: SpInstance): void {
      const expanded = this._isMobile()
        ? this._isShown()
        : !this.el.classList.contains("collapsed");
      this.trigger?.setAttribute("aria-expanded", String(expanded));
    },

    toggle(this: SpInstance, opts?: OpenOptions): void {
      if (this._isMobile()) {
        if (this._isShown()) this.hide();
        else this.show(opts);
        return;
      }
      const collapsed = this.el.classList.contains("collapsed");
      if (!this.emit(collapsed ? "expand" : "collapse")) return;

      // Transition is armed only on the transient class, so a user toggle
      // animates but an authored .collapsed settles instantly (dialog model).
      const transient = collapsed ? "expanding" : "collapsing";
      this.el.classList.add(transient);
      this.el.classList.toggle("collapsed", !collapsed);
      this._syncAria();
      this._afterTransition(() => this.el.classList.remove(transient));
    },

    // A tooltip per nav button (header/footer brand rows excluded), showing the
    // button's label only while the rail is collapsed and that label is hidden.
    _buildTooltips(this: SpInstance): void {
      const buttons = this.el.querySelectorAll<HTMLElement>(".sidebar-menu .sidebar-menu-button");
      for (const button of buttons) {
        const label = button.querySelector(":scope > span")?.textContent?.trim();
        if (!label) continue;

        const tip = document.createElement("div");
        tip.className = "tooltip";
        tip.textContent = label;
        // Decorative: the button is already its own accessible name.
        tip.setAttribute("aria-hidden", "true");
        tip.setAttribute(
          "data-sp-tooltip",
          `toggle: #${ensureId(button)}; placement: right`,
        );
        this.el.appendChild(tip);

        getInstance(tip, Tooltip);
        this.on(tip, "sp-beforeshow", (e) => {
          if (this._isMobile() || !this.el.classList.contains("collapsed")) {
            e.preventDefault();
          }
        });
      }
    },

    // No top layer; mounted is a marker attribute, visibility is class-driven.
    _isMounted(this: SpInstance): boolean {
      return this.el.hasAttribute("data-open");
    },
    _mount(this: SpInstance): void {
      this.el.setAttribute("data-open", "");
    },
    _unmount(this: SpInstance): void {
      this.el.removeAttribute("data-open");
    },
  },
});
