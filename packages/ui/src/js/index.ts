// Starting Point UI — JavaScript entry. Mid-migration: ported components run on
// the define/observer model; the rest keep their old modules until ported.

import { getInstance, start } from "./observer";
import type { ComponentFactory, SpInstance } from "./define";
import { Dialog } from "./dialog";
import { Sheet } from "./sheet";
import { Popover } from "./popover";
import { Tooltip } from "./tooltip";
import { Dropdown } from "./dropdown";
import { Combobox } from "./combobox";
import { Tabs } from "./tabs";
import { Collapsible } from "./collapsible";
import { Accordion } from "./accordion";

import { toast, ToastTrigger } from "./toast";

import * as resizable from "./resizable";
import * as sidebar from "./sidebar";
import "./checkbox";
import "./slider";

const components: ComponentFactory[] = [
  Dialog,
  Sheet,
  Popover,
  Tooltip,
  Dropdown,
  Combobox,
  Tabs,
  Collapsible,
  Accordion,
  ToastTrigger,
];

const dialog = (el: HTMLElement): SpInstance | null => getInstance(el, Dialog);
const sheet = (el: HTMLElement): SpInstance | null => getInstance(el, Sheet);
const popover = (el: HTMLElement): SpInstance | null => getInstance(el, Popover);
const tooltip = (el: HTMLElement): SpInstance | null => getInstance(el, Tooltip);
const dropdown = (el: HTMLElement): SpInstance | null => getInstance(el, Dropdown);
const combobox = (el: HTMLElement): SpInstance | null => getInstance(el, Combobox);
const tabs = (el: HTMLElement): SpInstance | null => getInstance(el, Tabs);
const collapsible = (el: HTMLElement): SpInstance | null => getInstance(el, Collapsible);
const accordion = (el: HTMLElement): SpInstance | null => getInstance(el, Accordion);

export {
  Dialog,
  Sheet,
  Popover,
  Tooltip,
  Dropdown,
  Combobox,
  Tabs,
  Collapsible,
  Accordion,
  dialog,
  sheet,
  popover,
  tooltip,
  dropdown,
  combobox,
  tabs,
  collapsible,
  accordion,
  toast,
  start,
  resizable,
  sidebar,
};
export type { SpInstance };

declare global {
  interface Window {
    sp: {
      dialog: typeof dialog;
      sheet: typeof sheet;
      popover: typeof popover;
      tooltip: typeof tooltip;
      dropdown: typeof dropdown;
      combobox: typeof combobox;
      tabs: typeof tabs;
      collapsible: typeof collapsible;
      accordion: typeof accordion;
      toast: typeof toast;
      // Legacy namespaces, dropped as each component is ported.
      resizable: typeof resizable;
      sidebar: typeof sidebar;
    };
  }
}

if (typeof document !== "undefined") {
  window.sp = {
    dialog,
    sheet,
    popover,
    tooltip,
    dropdown,
    combobox,
    tabs,
    collapsible,
    accordion,
    toast,
    resizable,
    sidebar,
  };

  const run = () => start(components);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
