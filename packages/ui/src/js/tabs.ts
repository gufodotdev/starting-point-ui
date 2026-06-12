// Tab list switching panels in place; the nth tab pairs with the nth panel.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, isDisabled } from "./utils";
import { Navigable } from "./mixins/navigable";

const TAB = ".tab";
const PANEL = ".tab-panel";

export const Tabs = define({
  name: "tabs",
  selector: "[data-sp-tabs]",
  mixins: [Navigable],

  props: {
    item: { type: String, default: TAB },
    orientation: { type: String, default: "horizontal" },
  },

  init(this: SpInstance) {
    // WAI-ARIA tabs semantics, applied unless authored.
    const list = this.el.querySelector<HTMLElement>(".tab-list");
    if (list) {
      if (!list.hasAttribute("role")) list.setAttribute("role", "tablist");
      if (this.config.orientation === "vertical") {
        list.setAttribute("aria-orientation", "vertical");
      }
    }

    const tabs: HTMLElement[] = this._tabs();
    const panels: HTMLElement[] = this._panels();
    tabs.forEach((tab, i) => {
      if (!tab.hasAttribute("role")) tab.setAttribute("role", "tab");
      const panel = panels[i];
      if (!panel) return;
      if (!panel.hasAttribute("role")) panel.setAttribute("role", "tabpanel");
      tab.setAttribute("aria-controls", ensureId(panel));
      panel.setAttribute("aria-labelledby", ensureId(tab));
      // Tab from the tablist lands on the panel even when its content
      // holds nothing focusable.
      if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
    });

    const initial =
      tabs.find((tab) => tab.classList.contains("active")) ??
      tabs.find((tab) => !isDisabled(tab));
    if (initial) this._sync(initial);

    this.on(this.el, "click", (e) => {
      const tab = (e.target as HTMLElement).closest<HTMLElement>(TAB);
      if (tab) this.select(tab);
    });
  },

  methods: {
    // Nested tabs own their own tabs and panels.
    _tabs(this: SpInstance): HTMLElement[] {
      return [...this.el.querySelectorAll<HTMLElement>(TAB)].filter(
        (tab) => tab.closest("[data-sp-tabs]") === this.el,
      );
    },

    _panels(this: SpInstance): HTMLElement[] {
      return [...this.el.querySelectorAll<HTMLElement>(PANEL)].filter(
        (panel) => panel.closest("[data-sp-tabs]") === this.el,
      );
    },

    select(this: SpInstance, tab: HTMLElement): void {
      if (!this._tabs().includes(tab)) return;
      if (isDisabled(tab) || tab.classList.contains("active")) return;
      if (!this.emit("beforechange", { tab })) return;
      this._sync(tab);
      this.emit("change", { tab });
    },

    // Reflect the selection into classes, aria-selected, and the roving tabindex.
    _sync(this: SpInstance, selected: HTMLElement): void {
      const panels: HTMLElement[] = this._panels();
      const tabs: HTMLElement[] = this._tabs();
      tabs.forEach((tab, i) => {
        const active = tab === selected;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i]?.classList.toggle("active", active);
      });
    },

    // Navigable: there is no overlay, the tablist is always interactive.
    _isMounted(): boolean {
      return true;
    },

    // Automatic activation: moving focus selects.
    _setActive(this: SpInstance, tab: HTMLElement): void {
      tab.focus();
      this.select(tab);
    },
  },
});
