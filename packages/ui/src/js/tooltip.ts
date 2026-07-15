// Anchored label shown on hover/focus.

import { define } from "./define";
import type { SpInstance } from "./define";
import { resolveTrigger } from "./utils";
import { Togglable } from "./mixins/togglable";
import { HoverToShow } from "./mixins/hover-to-show";
import { HoverOutHide } from "./mixins/hover-out-hide";
import { Escapable } from "./mixins/escapable";
import { Popoverable } from "./mixins/popoverable";
import { Anchorable } from "./mixins/anchorable";

export const Tooltip = define({
  name: "tooltip",
  selector: ".tooltip",
  mixins: [Togglable, HoverToShow, HoverOutHide, Escapable, Popoverable, Anchorable],

  props: {
    mode: { type: String, default: "hover" }, // override: activate the hover mixins
    placement: { type: String, default: "top" },
    // Panel-to-trigger distance lands at 10px with the arrow half included
    // (measured against the reference).
    offset: { type: Number, default: 5 },
  },

  init(this: SpInstance) {
    this.el.setAttribute("role", "tooltip");

    if (!this.el.querySelector("[data-sp-arrow]")) {
      const arrow = document.createElement("div");
      arrow.className = "tooltip-arrow";
      arrow.setAttribute("data-sp-arrow", "");
      this.el.appendChild(arrow);
    }

    const trigger = resolveTrigger(this);
    if (!trigger || !this.el.id) return;

    // Append to any existing aria-describedby rather than replacing it.
    const ids = (trigger.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    if (!ids.includes(this.el.id)) {
      trigger.setAttribute("aria-describedby", [...ids, this.el.id].join(" "));
    }
  },

  destroy(this: SpInstance) {
    if (!this.trigger || !this.el.id) return;
    const ids = (this.trigger.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id: string) => id && id !== this.el.id);
    if (ids.length) this.trigger.setAttribute("aria-describedby", ids.join(" "));
    else this.trigger.removeAttribute("aria-describedby");
  },
});
