// Starting Point UI Dropdown Module

import { type Placement } from "@floating-ui/dom";
import {
  closeIfOutside,
  closePoppable,
  findNextEnabled,
  getOpenPoppable,
  isDisabled,
  openPoppable,
  positionFloating,
  togglePoppable,
  type PoppableConfig,
} from "./utils";

const CONFIG: PoppableConfig = {
  rootSelector: ".dropdown",
  contentSelector: ".dropdown-menu",
  triggerSelector: "[data-sp-toggle='dropdown']",
  position: async (root, trigger, menu) => {
    await positionFloating(trigger, menu, {
      placement: (root.dataset.spPlacement as Placement) || "bottom-end",
      offset: parseInt(root.dataset.spOffset || "4", 10),
    });
  },
};

export const open = (dropdown: HTMLElement) => openPoppable(dropdown, CONFIG);
export const close = (dropdown: HTMLElement) => closePoppable(dropdown, CONFIG);
export const toggle = (dropdown: HTMLElement) => togglePoppable(dropdown, CONFIG);

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const toggleBtn = target.closest<HTMLElement>(CONFIG.triggerSelector);
  if (toggleBtn) {
    const dropdown = toggleBtn.closest<HTMLElement>(CONFIG.rootSelector);
    if (dropdown) {
      e.preventDefault();
      toggle(dropdown);
    }
    return;
  }

  const item = target.closest<HTMLElement>(".dropdown-item");
  if (item) {
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    const dropdown = item.closest<HTMLElement>(CONFIG.rootSelector);
    if (dropdown) close(dropdown);
    return;
  }

  closeIfOutside(target, CONFIG);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const dropdown = target.closest<HTMLElement>(CONFIG.rootSelector);

  const openDropdown = getOpenPoppable(CONFIG);
  if (e.key === "Escape" && openDropdown) {
    e.preventDefault();
    const trigger = openDropdown.querySelector<HTMLElement>(CONFIG.triggerSelector);
    close(openDropdown);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(CONFIG.triggerSelector)
  ) {
    e.preventDefault();
    if (dropdown) toggle(dropdown);
    return;
  }

  const menu = dropdown?.querySelector<HTMLElement>(CONFIG.contentSelector);
  if (!menu?.classList.contains("open")) return;

  const items = [...menu.querySelectorAll<HTMLElement>(".dropdown-item")];
  const currentIndex = items.indexOf(target);

  let nextItem: HTMLElement | null = null;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (currentIndex < 0) {
        nextItem = items.find((item) => !isDisabled(item)) ?? null;
      } else {
        nextItem = findNextEnabled(items, currentIndex, 1);
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      if (currentIndex < 0) {
        nextItem = [...items].reverse().find((item) => !isDisabled(item)) ?? null;
      } else {
        nextItem = findNextEnabled(items, currentIndex, -1);
      }
      break;
    case "Home":
      e.preventDefault();
      nextItem = items.find((item) => !isDisabled(item)) ?? null;
      break;
    case "End":
      e.preventDefault();
      nextItem = [...items].reverse().find((item) => !isDisabled(item)) ?? null;
      break;
  }

  nextItem?.focus();
}

function handleFocusOut(e: FocusEvent) {
  closeIfOutside(e.relatedTarget as HTMLElement | null, CONFIG);
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("focusout", handleFocusOut);
})();
