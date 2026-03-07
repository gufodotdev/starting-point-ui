// Starting Point UI - JavaScript

import * as accordion from "./accordion";
import * as collapsible from "./collapsible";
import * as combobox from "./combobox";
import * as dialog from "./dialog";
import * as dropdown from "./dropdown";
import * as resizable from "./resizable";
import * as sidebar from "./sidebar";
import * as tabs from "./tabs";

export {
  accordion,
  collapsible,
  combobox,
  dialog,
  dropdown,
  resizable,
  sidebar,
  tabs,
};

declare global {
  interface Window {
    sp: {
      accordion: typeof accordion;
      collapsible: typeof collapsible;
      combobox: typeof combobox;
      dialog: typeof dialog;
      dropdown: typeof dropdown;
      resizable: typeof resizable;
      sidebar: typeof sidebar;
      tabs: typeof tabs;
    };
  }
}

if (typeof window !== "undefined") {
  window.sp = {
    accordion,
    collapsible,
    combobox,
    dialog,
    dropdown,
    resizable,
    sidebar,
    tabs,
  };
}
