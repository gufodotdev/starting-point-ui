// Starting Point UI - JavaScript

import * as dialog from "./dialog";
import * as tabs from "./tabs";

export { dialog, tabs };

declare global {
  interface Window {
    sp: { dialog: typeof dialog; tabs: typeof tabs };
  }
}

if (typeof window !== "undefined") {
  window.sp = { dialog, tabs };
}
