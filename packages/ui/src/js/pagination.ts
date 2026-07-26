// Accessibility-only enhancement: derives the pagination ARIA from the
// classes, so authors don't repeat boilerplate. Labels the nav and the
// previous/next links, announces the authored .active link as the current
// page and keeps it in sync, and hides ellipses from assistive technology.
// Authored attributes win.

import { define } from "./define";
import type { SpInstance } from "./define";
import { announceCurrent } from "./utils";

export const Pagination = define({
  name: "pagination",
  selector: ".pagination",

  init(this: SpInstance) {
    const nav = this.el.closest("nav");
    if (nav && !nav.hasAttribute("aria-label")) nav.setAttribute("aria-label", "pagination");

    this._current = announceCurrent(this.el, ".pagination-item");

    this.el.querySelectorAll<HTMLElement>(".pagination-previous").forEach((el) => {
      if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Go to previous page");
    });
    this.el.querySelectorAll<HTMLElement>(".pagination-next").forEach((el) => {
      if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Go to next page");
    });

    this.el.querySelectorAll<HTMLElement>(".pagination-ellipsis").forEach((el) => {
      if (!el.hasAttribute("role")) el.setAttribute("role", "presentation");
      if (!el.hasAttribute("aria-hidden")) el.setAttribute("aria-hidden", "true");
    });
  },

  destroy(this: SpInstance) {
    this._current?.disconnect();
  },
});
