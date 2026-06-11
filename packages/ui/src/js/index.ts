// Starting Point UI — JavaScript entry. Mid-migration: ported components run on
// the define/observer model; the rest keep their old modules until ported.

import { getInstance, start } from "./observer";
import type { ComponentFactory, SpInstance } from "./define";
import { Dialog } from "./dialog";
import { Sheet } from "./sheet";
import { Popover } from "./popover";

import * as accordion from "./accordion";
import * as collapsible from "./collapsible";
import * as combobox from "./combobox";
import * as dropdown from "./dropdown";
import * as resizable from "./resizable";
import * as sidebar from "./sidebar";
import "./checkbox";
import "./slider";
import * as tabs from "./tabs";
import { toast } from "./toast";

const components: ComponentFactory[] = [Dialog, Sheet, Popover];

const dialog = (el: HTMLElement): SpInstance | null => getInstance(el, Dialog);
const sheet = (el: HTMLElement): SpInstance | null => getInstance(el, Sheet);
const popover = (el: HTMLElement): SpInstance | null => getInstance(el, Popover);

export {
  Dialog,
  Sheet,
  Popover,
  dialog,
  sheet,
  popover,
  start,
  accordion,
  collapsible,
  combobox,
  dropdown,
  resizable,
  sidebar,
  tabs,
  toast,
};
export type { SpInstance };

declare global {
  interface Window {
    sp: {
      dialog: typeof dialog;
      sheet: typeof sheet;
      popover: typeof popover;
      // Legacy namespaces, dropped as each component is ported.
      accordion: typeof accordion;
      collapsible: typeof collapsible;
      combobox: typeof combobox;
      dropdown: typeof dropdown;
      resizable: typeof resizable;
      sidebar: typeof sidebar;
      tabs: typeof tabs;
      toast: typeof toast;
    };
  }
}

if (typeof document !== "undefined") {
  window.sp = {
    dialog,
    sheet,
    popover,
    accordion,
    collapsible,
    combobox,
    dropdown,
    resizable,
    sidebar,
    tabs,
    toast,
  };

  const run = () => start(components);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
