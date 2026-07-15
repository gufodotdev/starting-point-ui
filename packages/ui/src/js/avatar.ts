// Native fallback switching: the CSS hides .avatar-fallback while a working
// .avatar-image is present; this hides the image when it fails to load so
// the fallback takes over (and brings it back if a new src loads).

import { define } from "./define";
import type { SpInstance } from "./define";

export const Avatar = define({
  name: "avatar",
  selector: ".avatar",

  init(this: SpInstance) {
    const img = this.el.querySelector<HTMLImageElement>(".avatar-image");
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) img.hidden = true;
    this.on(img, "error", () => {
      img.hidden = true;
    });
    this.on(img, "load", () => {
      img.hidden = false;
    });
  },
});
