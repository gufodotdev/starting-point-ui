// Modal dialog on a native <dialog>. Composes the lifecycle (Togglable), trigger
// (ClickToShow), and modal mechanism (Modalable).

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Modalable } from "./mixins/modalable";

export const Dialog = define({
  name: "dialog",
  selector: "[data-sp-dialog]",
  mixins: [Togglable, ClickToShow, Modalable],

  props: { static: Boolean }, // backdrop click won't close it (Escape still does)

  init(this: SpInstance) {
    // Wire aria-labelledby / aria-describedby to the title and description.
    link(this.el, ".dialog-title", "aria-labelledby");
    link(this.el, ".dialog-description", "aria-describedby");

    this.el.querySelectorAll<HTMLElement>("[data-sp-dismiss]").forEach((btn) => {
      this.on(btn, "click", () => this.hide());
    });

    // A click whose target is the <dialog> itself landed on the backdrop.
    this.on(this.el, "click", (e) => {
      if (e.target !== this.el) return;
      if (this.config.static) this.emit("hideprevented");
      else this.hide();
    });
  },
});

function link(dialog: HTMLElement, selector: string, attr: string): void {
  if (dialog.hasAttribute(attr)) return;
  const target = dialog.querySelector<HTMLElement>(selector);
  if (target) dialog.setAttribute(attr, ensureId(target));
}
