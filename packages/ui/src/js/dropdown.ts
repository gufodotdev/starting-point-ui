// Starting Point UI Dropdown Module

import { type Placement } from "@floating-ui/dom";
import {
  closeAnchor,
  closeAnchorIfOutside,
  getAnchorTrigger,
  getOpenAnchor,
  getTargetContent,
  installHoverTriggers,
  openAnchor,
  positionFloating,
  toggleAnchor,
  type AnchorOptions,
} from "./floating";
import { findNextEnabled, isDisabled } from "./utils";

const TRIGGER_SELECTOR = "[data-sp-toggle='dropdown']";
const CONTENT_SELECTOR = ".dropdown";

const OPTS: AnchorOptions = {
  contentSelector: CONTENT_SELECTOR,
  triggerSelector: TRIGGER_SELECTOR,
  position: async (trigger, menu) => {
    await positionFloating(trigger, menu, {
      placement: (trigger.dataset.spPlacement as Placement) || "bottom-end",
      offset: parseInt(trigger.dataset.spOffset || "4", 10),
    });
  },
};

export const open = (trigger: HTMLElement) => {
  const menu = getTargetContent(trigger);
  if (menu) openAnchor(trigger, menu, OPTS, { viaClick: true });
};
export const close = (menu: HTMLElement) => closeAnchor(menu, OPTS);
export const toggle = (trigger: HTMLElement) => {
  const menu = getTargetContent(trigger);
  if (menu) toggleAnchor(trigger, menu, OPTS, { viaClick: true });
};

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const trigger = target.closest<HTMLElement>(TRIGGER_SELECTOR);
  if (trigger) {
    const menu = getTargetContent(trigger);
    if (!menu) return;
    e.preventDefault();
    toggleAnchor(trigger, menu, OPTS, { viaClick: true });
    return;
  }

  const item = target.closest<HTMLElement>(".dropdown-item");
  if (item) {
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    const menu = item.closest<HTMLElement>(CONTENT_SELECTOR);
    if (menu) closeAnchor(menu, OPTS);
    return;
  }

  closeAnchorIfOutside(target, OPTS);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;

  const openMenu = getOpenAnchor(OPTS);
  if (e.key === "Escape" && openMenu) {
    e.preventDefault();
    const trigger = getAnchorTrigger(openMenu);
    closeAnchor(openMenu, OPTS);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(TRIGGER_SELECTOR)
  ) {
    e.preventDefault();
    const menu = getTargetContent(target);
    if (menu) toggleAnchor(target, menu, OPTS, { viaClick: true });
    return;
  }

  // Arrow nav works whether focus is on an item OR on the trigger of an open menu.
  const menu =
    target.closest<HTMLElement>(CONTENT_SELECTOR) ??
    (target.matches(TRIGGER_SELECTOR) ? getTargetContent(target) : null);
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
  closeAnchorIfOutside(e.relatedTarget as HTMLElement | null, OPTS);
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("focusout", handleFocusOut);
  installHoverTriggers(OPTS);
})();
