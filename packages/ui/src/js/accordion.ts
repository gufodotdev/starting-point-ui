// Group of collapsibles: the nth trigger pairs with the nth panel, one panel
// open at a time unless multiple is set.

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";
import { Collapsible } from "./collapsible";
import { Navigable } from "./mixins/navigable";
import { ensureId } from "./utils";

const TRIGGER = ".accordion-trigger";
const PANEL = ".accordion-panel";

export const Accordion = define({
  name: "accordion",
  selector: "[data-sp-accordion]",
  mixins: [Navigable],

  props: {
    item: { type: String, default: TRIGGER },
    multiple: Boolean,
  },

  init(this: SpInstance) {
    // Nested accordions own their own triggers and panels.
    const mine = (el: HTMLElement) => el.closest("[data-sp-accordion]") === this.el;
    const triggers = [...this.el.querySelectorAll<HTMLElement>(TRIGGER)].filter(mine);
    const panels = [...this.el.querySelectorAll<HTMLElement>(PANEL)].filter(mine);

    triggers.forEach((trigger, i) => {
      const panel = panels[i];
      if (!panel) return;
      // Each panel becomes a Collapsible owned by its trigger; that brings the
      // toggle behavior, lifecycle events, and aria-expanded/controls wiring.
      panel.setAttribute("data-sp-collapsible", `toggle: #${ensureId(trigger)}`);
      if (!panel.hasAttribute("role")) panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", ensureId(trigger));
      getInstance(panel, Collapsible);
    });

    // Single open: a panel starting to show closes its open siblings.
    this.on(this.el, "sp-beforeshow", (e) => {
      if (this.config.multiple) return;
      const target = e.target as HTMLElement;
      if (!target.matches(PANEL) || !mine(target)) return;
      for (const panel of panels) {
        if (panel !== target) getInstance(panel, Collapsible)?.hide();
      }
    });
  },

  methods: {
    // Navigable: no overlay; arrows move focus between the header buttons.
    _isMounted(): boolean {
      return true;
    },
  },
});
