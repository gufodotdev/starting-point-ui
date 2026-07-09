// Navbar menu: purely presentational except that the authored .active item
// is announced as the current page.

import { define } from "./define";
import type { SpInstance } from "./define";
import { announceCurrent } from "./utils";

export const Navbar = define({
  name: "navbar",
  selector: ".navbar-menu",

  init(this: SpInstance) {
    this._current = announceCurrent(this.el, ".navbar-menu-item");
  },

  destroy(this: SpInstance) {
    this._current?.disconnect();
  },
});
