// Starting Point UI - JavaScript

import * as accordion from "./accordion";
import * as collapsible from "./collapsible";
import * as dialog from "./dialog";
import * as dropdown from "./dropdown";
import * as tabs from "./tabs";

export { accordion, collapsible, dialog, dropdown, tabs };

declare global {
  interface Window {
    sp: {
      accordion: typeof accordion;
      collapsible: typeof collapsible;
      dialog: typeof dialog;
      dropdown: typeof dropdown;
      tabs: typeof tabs;
    };
  }
}

if (typeof window !== "undefined") {
  window.sp = { accordion, collapsible, dialog, dropdown, tabs };
}
