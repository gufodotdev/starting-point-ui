// Starting Point UI — JavaScript entry.

import { getInstance, start } from "./observer";
import { inlineEvents } from "./inline-events";
import type { ComponentFactory, SpInstance } from "./define";
import { Carousel } from "./carousel";
import { Command } from "./command";
import { Dialog } from "./dialog";
import { Drawer } from "./drawer";
import { Sheet } from "./sheet";
import { Popover } from "./popover";
import { Tooltip } from "./tooltip";
import { Dropdown } from "./dropdown";
import { Combobox } from "./combobox";
import { Tabs } from "./tabs";
import { Collapsible } from "./collapsible";
import { Accordion } from "./accordion";

import { toast, ToastTrigger } from "./toast";
import { Slider, SliderRange } from "./slider";
import { Avatar } from "./avatar";
import { Breadcrumb } from "./breadcrumb";
import { Pagination } from "./pagination";
import { Sidebar } from "./sidebar";

const components: ComponentFactory[] = [
  Carousel,
  Command,
  Dialog,
  Drawer,
  Sheet,
  Popover,
  Tooltip,
  Dropdown,
  Combobox,
  Tabs,
  Collapsible,
  Accordion,
  ToastTrigger,
  Avatar,
  Breadcrumb,
  Slider,
  SliderRange,
  Pagination,
  Sidebar,
];

const carousel = (el: HTMLElement): SpInstance | null => getInstance(el, Carousel);
const command = (el: HTMLElement): SpInstance | null => getInstance(el, Command);
const dialog = (el: HTMLElement): SpInstance | null => getInstance(el, Dialog);
const drawer = (el: HTMLElement): SpInstance | null => getInstance(el, Drawer);
const sheet = (el: HTMLElement): SpInstance | null => getInstance(el, Sheet);
const popover = (el: HTMLElement): SpInstance | null => getInstance(el, Popover);
const tooltip = (el: HTMLElement): SpInstance | null => getInstance(el, Tooltip);
const dropdown = (el: HTMLElement): SpInstance | null => getInstance(el, Dropdown);
const combobox = (el: HTMLElement): SpInstance | null => getInstance(el, Combobox);
const tabs = (el: HTMLElement): SpInstance | null => getInstance(el, Tabs);
const collapsible = (el: HTMLElement): SpInstance | null => getInstance(el, Collapsible);
const accordion = (el: HTMLElement): SpInstance | null => getInstance(el, Accordion);
const slider = (el: HTMLElement): SpInstance | null => getInstance(el, Slider);
const sliderRange = (el: HTMLElement): SpInstance | null => getInstance(el, SliderRange);
const avatar = (el: HTMLElement): SpInstance | null => getInstance(el, Avatar);
const breadcrumb = (el: HTMLElement): SpInstance | null => getInstance(el, Breadcrumb);
const pagination = (el: HTMLElement): SpInstance | null => getInstance(el, Pagination);
const sidebar = (el: HTMLElement): SpInstance | null => getInstance(el, Sidebar);

export {
  Avatar,
  Breadcrumb,
  Carousel,
  Command,
  Dialog,
  Drawer,
  Sheet,
  Popover,
  Tooltip,
  Dropdown,
  Combobox,
  Tabs,
  Collapsible,
  Accordion,
  Slider,
  SliderRange,
  Sidebar,
  carousel,
  command,
  dialog,
  drawer,
  sheet,
  popover,
  tooltip,
  dropdown,
  combobox,
  tabs,
  collapsible,
  accordion,
  slider,
  sliderRange,
  avatar,
  breadcrumb,
  pagination,
  sidebar,
  toast,
  start,
};
export type { SpInstance };

declare global {
  interface Window {
    sp: {
      carousel: typeof carousel;
      command: typeof command;
      dialog: typeof dialog;
      drawer: typeof drawer;
      sheet: typeof sheet;
      popover: typeof popover;
      tooltip: typeof tooltip;
      dropdown: typeof dropdown;
      combobox: typeof combobox;
      tabs: typeof tabs;
      collapsible: typeof collapsible;
      accordion: typeof accordion;
      slider: typeof slider;
      sliderRange: typeof sliderRange;
      avatar: typeof avatar;
      breadcrumb: typeof breadcrumb;
      pagination: typeof pagination;
      sidebar: typeof sidebar;
      toast: typeof toast;
    };
  }
}

if (typeof document !== "undefined") {
  window.sp = {
    carousel,
    command,
    dialog,
    drawer,
    sheet,
    popover,
    tooltip,
    dropdown,
    combobox,
    tabs,
    collapsible,
    accordion,
    slider,
  sliderRange,
    avatar,
    breadcrumb,
    pagination,
    sidebar,
    toast,
  };

  const run = () => {
    inlineEvents();
    start(components);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
