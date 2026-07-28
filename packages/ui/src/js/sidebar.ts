// App-shell panel: a backdrop drawer below the sidebar breakpoint, a
// collapsible in-flow column above it.

import { define } from "./define";
import type { OpenOptions, SpInstance } from "./define";
import { getInstance } from "./observer";
import { announceCurrent, ensureId } from "./utils";
import { Tooltip } from "./tooltip";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { Escapable } from "./mixins/escapable";

export const Sidebar = define({
  name: "sidebar",
  selector: ".sidebar",
  mixins: [Togglable, ClickToShow, ClickOutsideHide, Escapable],

  init(this: SpInstance) {
    // Authored on the panel so the collapse mode's first paint is correct
    // pre-JS; default here only fills it in for CSS that reads the attribute.
    if (!this.el.hasAttribute("data-sp-collapse")) {
      this.el.setAttribute("data-sp-collapse", "offcanvas");
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
      if (!this._isMobile() && this._isMounted()) this._hideDrawer();
      this._syncAria();
    });

    if (this.el.getAttribute("data-sp-collapse") === "icon") this._buildTooltips();

    this._current = announceCurrent(
      this.el,
      ".sidebar-menu-button, .sidebar-menu-sub-button",
    );
    this._syncAria();
  },

  destroy(this: SpInstance) {
    this._current?.disconnect();
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

    // Each axis speaks its own dialect: show/hide drive the mobile drawer
    // (an overlay), expand/collapse drive the desktop column (disclosure).
    // toggle follows the viewport, like the trigger does.
    show(this: SpInstance, opts?: OpenOptions): void {
      if (!this._isMobile()) return;
      (Togglable.methods!.show as (this: SpInstance, opts?: OpenOptions) => void).call(this, opts);
    },

    hide(this: SpInstance): void {
      if (this._isMounted()) this._hideDrawer();
    },

    expand(this: SpInstance): void {
      this._setCollapsed(false);
    },

    collapse(this: SpInstance): void {
      this._setCollapsed(true);
    },

    toggle(this: SpInstance, opts?: OpenOptions): void {
      if (this._isMobile()) {
        if (this._isShown()) this.hide();
        else this.show(opts);
      }
      else if (this.el.classList.contains("collapsed")) this.expand();
      else this.collapse();
    },

    _hideDrawer(this: SpInstance): void {
      Togglable.methods!.hide!.call(this);
    },

    _setCollapsed(this: SpInstance, collapsed: boolean): void {
      if (this.el.classList.contains("collapsed") === collapsed) return;
      if (!this.emit(collapsed ? "beforecollapse" : "beforeexpand")) return;

      // Transition is armed only on the transient class, so a user toggle
      // animates but an authored .collapsed settles instantly (dialog model).
      const transient = collapsed ? "collapsing" : "expanding";
      this.el.classList.add(transient);
      this.el.classList.toggle("collapsed", collapsed);
      this._syncAria();
      this.emit(collapsed ? "collapse" : "expand");
      this._afterTransition(() => {
        this.el.classList.remove(transient);
        this.emit(collapsed ? "collapsed" : "expanded");
      });
    },

    // A tooltip per nav button (header/footer brand rows excluded), showing the
    // button's label only while that label is hidden: while the rail is
    // collapsed, or always for icon-only buttons with an sr-only label.
    _buildTooltips(this: SpInstance): void {
      const buttons = this.el.querySelectorAll<HTMLElement>(".sidebar-menu .sidebar-menu-button");
      for (const button of buttons) {
        const span = button.querySelector<HTMLElement>(":scope > span");
        const label = span?.textContent?.trim();
        if (!span || !label) continue;

        const tip = document.createElement("div");
        tip.className = "tooltip";
        tip.textContent = label;
        // Decorative: the button is already its own accessible name.
        tip.setAttribute("aria-hidden", "true");
        tip.setAttribute("data-sp-toggle", `#${ensureId(button)}`);
        tip.setAttribute("data-sp-placement", "inline-end");
        this.el.appendChild(tip);

        getInstance(tip, Tooltip);
        this.on(tip, "sp-beforeshow", (e) => {
          const labelHidden =
            this.el.classList.contains("collapsed") || span.offsetWidth <= 1;
          if (this._isMobile() || !labelHidden) e.preventDefault();
        });
      }
    },

    // Mounted tracks data-sp-open (stable through the exit animation), not
    // :popover-open which flips the instant hidePopover() runs.
    _isMounted(this: SpInstance): boolean {
      return this.el.hasAttribute("data-sp-open");
    },
    _mount(this: SpInstance): void {
      const el = this.el as HTMLElement & {
        showPopover(): void;
      };
      el.setAttribute("popover", "manual");
      if (!el.matches(":popover-open")) el.showPopover();
      el.setAttribute("data-sp-open", "");
    },
    _unmount(this: SpInstance): void {
      const el = this.el as HTMLElement & {
        hidePopover(): void;
      };
      el.removeAttribute("data-sp-open");
      if (el.matches(":popover-open")) el.hidePopover();
      el.removeAttribute("popover");
    },
  },
});
