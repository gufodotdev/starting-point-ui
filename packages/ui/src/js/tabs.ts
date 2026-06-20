// Tab list switching content panels in place. Each tab points at its panel with
// data-sp-toggle, so the panels can live anywhere on the page; the tab-list is
// the component and drives selection, arrow-key nav, and the roving tabindex.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, isDisabled } from "./utils";
import { Navigable } from "./mixins/navigable";

const TAB = ".tab";

export const Tabs = define({
  name: "tabs",
  selector: ".tab-list",
  mixins: [Navigable],

  props: {
    item: { type: String, default: TAB },
    orientation: { type: String, default: "horizontal" },
  },

  init(this: SpInstance) {
    // WAI-ARIA tabs semantics on the list itself, applied unless authored.
    if (!this.el.hasAttribute("role")) this.el.setAttribute("role", "tablist");
    if (this.config.orientation === "vertical") {
      this.el.setAttribute("aria-orientation", "vertical");
    }

    const tabs: HTMLElement[] = this._tabs();
    tabs.forEach((tab) => {
      if (!tab.hasAttribute("role")) tab.setAttribute("role", "tab");
      const panel = this._panel(tab);
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
      if (tab && tabs.includes(tab)) this.select(tab);
    });
  },

  methods: {
    // Nested tab-lists own their own tabs.
    _tabs(this: SpInstance): HTMLElement[] {
      return [...this.el.querySelectorAll<HTMLElement>(TAB)].filter(
        (tab) => tab.closest(".tab-list") === this.el,
      );
    },

    // The panel a tab controls, resolved from its data-sp-toggle selector.
    _panel(this: SpInstance, tab: HTMLElement): HTMLElement | null {
      const sel = tab.getAttribute("data-sp-toggle");
      return sel ? document.querySelector<HTMLElement>(sel) : null;
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
      const tabs: HTMLElement[] = this._tabs();
      tabs.forEach((tab) => {
        const active = tab === selected;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        this._panel(tab)?.classList.toggle("active", active);
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
