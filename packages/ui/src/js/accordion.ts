// Coordinates a group of plain collapsibles: wrap any collapsibles in .accordion
// and opening one closes the others, unless multiple is set. The collapsibles
// keep their own toggle and lifecycle; the accordion adds the single-open rule
// and the accordion ARIA roles (the triggers' aria-expanded/controls already
// come from the collapsible).

import { define } from "./define";
import type { SpInstance } from "./define";
import { getInstance } from "./observer";
import { Collapsible } from "./collapsible";
import { ensureId } from "./utils";

const PANEL = ".accordion-panel";

export const Accordion = define({
  name: "accordion",
  selector: ".accordion",

  props: {
    multiple: Boolean,
  },

  init(this: SpInstance) {
    // Nested accordions own their own panels.
    const mine = (el: HTMLElement) => el.closest(".accordion") === this.el;
    const panels = [...this.el.querySelectorAll<HTMLElement>(PANEL)].filter(mine);

    for (const panel of panels) {
      // Ensure the panel's collapsible is live so the trigger gets its
      // aria-expanded / aria-controls before we add the region semantics.
      getInstance(panel, Collapsible);
      // The trigger is the one the collapsible points at (data-sp-toggle); label
      // the panel as a region named by it, per the APG accordion pattern.
      const toggle = panel.getAttribute("data-sp-toggle");
      const trigger = toggle && document.querySelector<HTMLElement>(toggle);
      if (!trigger) continue;
      if (!panel.hasAttribute("role")) panel.setAttribute("role", "region");
      if (!panel.hasAttribute("aria-labelledby")) {
        panel.setAttribute("aria-labelledby", ensureId(trigger));
      }
    }

    this.on(this.el, "sp-beforeexpand", (e) => {
      if (this.config.multiple) return;
      const target = e.target as HTMLElement;
      if (!panels.includes(target)) return;
      for (const panel of panels) {
        if (panel !== target) getInstance(panel, Collapsible)?.collapse();
      }
    });
  },
});
