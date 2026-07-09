// Starting Point UI — JavaScript entry.

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
import { Slider } from "./slider";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

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
  Slider,
  Navbar,
  Sidebar,
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
const slider = (el: HTMLElement): SpInstance | null => getInstance(el, Slider);
const navbar = (el: HTMLElement): SpInstance | null => getInstance(el, Navbar);
const sidebar = (el: HTMLElement): SpInstance | null => getInstance(el, Sidebar);

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
  Slider,
  Sidebar,
  dialog,
  sheet,
  popover,
  tooltip,
  dropdown,
  combobox,
  tabs,
  collapsible,
  accordion,
  slider,
  navbar,
  sidebar,
  toast,
  start,
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
      slider: typeof slider;
      navbar: typeof navbar;
      sidebar: typeof sidebar;
      toast: typeof toast;
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
    slider,
    navbar,
    sidebar,
    toast,
  };

  const run = () => start(components);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
