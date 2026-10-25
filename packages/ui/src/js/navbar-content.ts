// A navbar panel: floating under its trigger, or a sub-menu folded into the
// drawer.

import { define } from "./define";
import type { OpenOptions, SpInstance } from "./define";
import { anchoredPanels, belowBreakpoint, resolveTrigger } from "./utils";
import { getInstance } from "./observer";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { FocusOutsideHide } from "./mixins/focus-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Anchorable } from "./mixins/anchorable";
import { Navigable } from "./mixins/navigable";

export const NavbarContent = define({
  name: "navbar-content",
  selector: ".navbar-content",
  mixins: [Togglable, ClickToShow, ClickOutsideHide, FocusOutsideHide, Escapable, Navigable, Anchorable],

  props: {
    offset: { type: Number, default: 8 },
    item: { type: String, default: ".navbar-link" },
    orientation: { type: String, default: "both" },
    mode: { type: String, default: "hover" },
  },

  init(this: SpInstance) {
    const trigger = resolveTrigger(this);
    const timer = () => this._hoverT as ReturnType<typeof setTimeout>;

    // A click pins the panel with a flag rather than by focus, since Safari
    // does not focus clicked buttons.
    if (trigger && this.config.mode === "hover") {
      const held = () =>
        this._pinned ||
        trigger.matches(":hover") ||
        anchoredPanels(this.el).some((panel) => panel.matches(":hover") || panel.contains(document.activeElement));
      const leave = () => {
        clearTimeout(timer());
        if (this._isFolded()) return;
        this._hoverT = setTimeout(() => {
          if (!held()) this.hide();
        }, 50);
      };
      this.on(trigger, "pointerenter", (e) => {
        if (this._isFolded() || (e as PointerEvent).pointerType === "touch") return;
        clearTimeout(timer());
        this._hoverT = setTimeout(() => {
          if (this._isMounted() || this._isFolded()) return;
          this._hovered = true;
          this.show({ trigger });
        }, 50);
      });
      this.on(trigger, "pointerleave", leave);
      this.on(this.el, "pointerenter", () => clearTimeout(timer()));
      this.on(this.el, "pointerleave", leave);
      this.on(this.el, "sp-hide", (e) => {
        if (e.target === this.el) clearTimeout(timer());
      });
    }
    this.on(this.el, "sp-hidden", (e) => {
      if (e.target !== this.el) return;
      this._hovered = false;
      this._pinned = false;
    });

    this.on(this.el, "click", (e) => {
      if ((e.target as Element).closest("a[href]")) this.hide();
    });

    // Handled ahead of the drawer's document-level Escape, so only the sub-menu
    // closes.
    const escape = (e: Event) => {
      if ((e as KeyboardEvent).key !== "Escape" || !this._isFolded() || !this._isMounted()) return;
      e.stopPropagation();
      this.hide();
    };
    this.on(this.el, "keydown", escape);
    if (trigger) this.on(trigger, "keydown", escape);

    this.on(window, "resize", () => {
      if (this._isMounted() && this._kind !== this._currentKind()) this.hide();
    });

    this.on(this.el, "sp-show", (e) => {
      if (e.target !== this.el) return;
      const nav = this.el.closest(".navbar-nav");
      for (const panel of nav?.querySelectorAll<HTMLElement>(".navbar-content") ?? []) {
        if (panel === this.el) continue;
        // Its focus return would otherwise count as focus leaving this panel.
        if (panel.contains(document.activeElement)) this.trigger?.focus();
        getInstance(panel, NavbarContent)?.hide();
      }
    });

    this.on(this.el, "sp-beforehide", (e) => {
      if (e.target === this.el && this._isFolded()) this._measure();
    });
  },

  methods: {
    _isFolded(this: SpInstance): boolean {
      return !!this.el.closest(".navbar-collapse") && belowBreakpoint("--breakpoint-navbar");
    },
    _isFullWidth(this: SpInstance): boolean {
      return !!this.el.closest(".navbar") && !this.el.closest(".navbar-collapse") && belowBreakpoint("--breakpoint-navbar");
    },
    _currentKind(this: SpInstance): string {
      return this._isFolded() ? "folded" : this._isFullWidth() ? "full" : "floating";
    },
    // Read by the outside-dismiss and arrow-key mixins.
    _isInFlow(this: SpInstance): boolean {
      return this._isFolded();
    },
    _keepsFocusOnOpen(): boolean {
      return true;
    },
    _measure(this: SpInstance): void {
      this.el.style.setProperty("--sp-collapse-height", `${this.el.scrollHeight}px`);
    },

    // A click pins a hover-opened panel, even mid-animation, rather than
    // closing it.
    toggle(this: SpInstance, opts?: OpenOptions): void {
      if (this._isMounted() && this._hovered && !this._pinned) {
        this._pinned = true;
        return;
      }
      if (!this._isMounted()) this._pinned = true;
      (Togglable.methods!.toggle as (this: SpInstance, opts?: OpenOptions) => void).call(this, opts);
    },

    _reference(this: SpInstance) {
      if (this._isFullWidth()) return this.el.closest(".navbar");
      return Anchorable.methods!._reference!.call(this);
    },
    _position(this: SpInstance): void {
      if (!this._isFullWidth()) {
        Anchorable.methods!._position!.call(this);
        return;
      }
      const bottom = Math.max(0, (this.el.closest(".navbar") as HTMLElement).getBoundingClientRect().bottom);
      this.el.style.left = "0px";
      this.el.style.top = `${bottom}px`;
      this.el.style.transformOrigin = "top";
      this.el.style.setProperty("--sp-available-height", `${Math.floor(window.innerHeight - bottom)}px`);
    },

    _startAnchor(this: SpInstance): void {
      if (this._isFolded()) return;
      Anchorable.methods!._startAnchor!.call(this);
    },

    // Mounted tracks data-sp-open (stable through the exit animation), not
    // :popover-open which flips the instant hidePopover() runs.
    _isMounted(this: SpInstance): boolean {
      return this.el.hasAttribute("data-sp-open");
    },
    _mount(this: SpInstance): void {
      const el = this.el as HTMLElement & { showPopover(): void };
      el.setAttribute("data-sp-open", "");
      this._kind = this._currentKind();
      if (this._isFolded()) {
        this._measure();
        return;
      }
      el.setAttribute("popover", "manual");
      if (!el.matches(":popover-open")) el.showPopover();
      this._position();
    },
    _unmount(this: SpInstance): void {
      const el = this.el as HTMLElement & { hidePopover(): void };
      // The toggle takes focus when a resize has hidden the trigger.
      if (el.contains(document.activeElement)) {
        this.trigger?.focus();
        if (el.contains(document.activeElement)) el.closest(".navbar")?.querySelector<HTMLElement>(".navbar-toggle")?.focus();
      }
      el.removeAttribute("data-sp-open");
      if (el.matches(":popover-open")) el.hidePopover();
      el.removeAttribute("popover");
    },
  },
});
