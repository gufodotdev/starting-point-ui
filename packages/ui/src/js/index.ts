// Starting Point UI - JavaScript

import * as collapsible from "./collapsible";
import * as dialog from "./dialog";
import * as dropdown from "./dropdown";
import * as tabs from "./tabs";

export { collapsible, dialog, dropdown, tabs };

declare global {
  interface Window {
    sp: {
      collapsible: typeof collapsible;
      dialog: typeof dialog;
      dropdown: typeof dropdown;
      tabs: typeof tabs;
    };
  }
}

if (typeof window !== "undefined") {
  window.sp = { collapsible, dialog, dropdown, tabs };
}
