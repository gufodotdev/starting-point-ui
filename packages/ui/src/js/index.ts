// Starting Point UI - JavaScript

import * as dialog from "./dialog";
import * as dropdown from "./dropdown";
import * as tabs from "./tabs";

export { dialog, dropdown, tabs };

declare global {
  interface Window {
    sp: { dialog: typeof dialog; dropdown: typeof dropdown; tabs: typeof tabs };
  }
}

if (typeof window !== "undefined") {
  window.sp = { dialog, dropdown, tabs };
}
