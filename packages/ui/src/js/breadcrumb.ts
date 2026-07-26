// Accessibility-only enhancement: derives the breadcrumb ARIA from the
// classes, so authors don't repeat boilerplate. Labels the nav, announces the
// authored .active item as the current page and keeps it in sync, and hides
// separators and ellipses from assistive technology. Authored attributes win.

import { define } from "./define";
import type { SpInstance } from "./define";
import { announceCurrent } from "./utils";

export const Breadcrumb = define({
  name: "breadcrumb",
  selector: ".breadcrumb",

  init(this: SpInstance) {
    const nav = this.el.closest("nav");
    if (nav && !nav.hasAttribute("aria-label")) nav.setAttribute("aria-label", "breadcrumb");

    this._current = announceCurrent(this.el, ".breadcrumb-item");

    this.el
      .querySelectorAll<HTMLElement>(".breadcrumb-separator, .breadcrumb-ellipsis")
      .forEach((el) => {
        if (!el.hasAttribute("role")) el.setAttribute("role", "presentation");
        if (!el.hasAttribute("aria-hidden")) el.setAttribute("aria-hidden", "true");
      });
  },

  destroy(this: SpInstance) {
    this._current?.disconnect();
  },
});
