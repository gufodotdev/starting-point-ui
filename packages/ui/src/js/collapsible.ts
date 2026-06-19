// Inline panel that expands and collapses in place.

import { define } from "./define";
import type { SpInstance } from "./define";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";

export const Collapsible = define({
  name: "collapsible",
  selector: ".collapsible",
  mixins: [Togglable, ClickToShow],

  init(this: SpInstance) {
    // The down/up keyframes animate to/from the measured content height.
    this.on(this.el, "sp-beforeshow", () => this._measure());
    this.on(this.el, "sp-beforehide", () => this._measure());
  },

  methods: {
    _measure(this: SpInstance): void {
      this.el.style.setProperty("--sp-collapse-height", `${this.el.scrollHeight}px`);
    },

    // No top layer: mounted state is just a marker attribute, visibility is
    // driven entirely by the lifecycle classes.
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
