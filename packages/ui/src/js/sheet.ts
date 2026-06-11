// Modal <dialog> that slides in from a screen edge (edge/animation in CSS).

import { define } from "./define";
import type { SpInstance } from "./define";
import { linkAria } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Modalable } from "./mixins/modalable";
import { Dismissable } from "./mixins/dismissable";

export const Sheet = define({
  name: "sheet",
  selector: "[data-sp-sheet]",
  mixins: [Togglable, ClickToShow, Modalable, Dismissable],

  init(this: SpInstance) {
    linkAria(this.el, ".sheet-title", "aria-labelledby");
    linkAria(this.el, ".sheet-description", "aria-describedby");
  },
});
