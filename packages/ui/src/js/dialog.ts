// Modal dialog on a native <dialog>.

import { define } from "./define";
import type { SpInstance } from "./define";
import { linkAria } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { Modalable } from "./mixins/modalable";
import { Dismissable } from "./mixins/dismissable";

export const Dialog = define({
  name: "dialog",
  selector: "[data-sp-dialog]",
  mixins: [Togglable, ClickToShow, Modalable, Dismissable],

  init(this: SpInstance) {
    linkAria(this.el, ".dialog-title", "aria-labelledby");
    linkAria(this.el, ".dialog-description", "aria-describedby");
  },
});
