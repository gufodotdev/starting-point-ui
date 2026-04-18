// Starting Point UI Popover Module

import { type Placement } from "@floating-ui/dom";
import {
  closeIfOutside,
  closePoppable,
  getFocusableElements,
  getOpenPoppable,
  openPoppable,
  positionFloating,
  togglePoppable,
  type PoppableConfig,
} from "./utils";

const CONFIG: PoppableConfig = {
  rootSelector: ".popover",
  contentSelector: ".popover-content",
  triggerSelector: "[data-sp-toggle='popover']",
  position: async (root, trigger, content) => {
    await positionFloating(trigger, content, {
      placement: (root.dataset.spPlacement as Placement) || "bottom",
      offset: parseInt(root.dataset.spOffset || "4", 10),
    });
  },
  onAfterOpen: (_root, content) => {
    if (!content.hasAttribute("tabindex")) content.tabIndex = -1;
    content.focus();
  },
};

export const open = (popover: HTMLElement) => openPoppable(popover, CONFIG);
export const close = (popover: HTMLElement) => closePoppable(popover, CONFIG);
export const toggle = (popover: HTMLElement) => togglePoppable(popover, CONFIG);

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const toggleBtn = target.closest<HTMLElement>(CONFIG.triggerSelector);
  if (toggleBtn) {
    const popover = toggleBtn.closest<HTMLElement>(CONFIG.rootSelector);
    if (popover) {
      e.preventDefault();
      toggle(popover);
    }
    return;
  }

  closeIfOutside(target, CONFIG);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const popover = target.closest<HTMLElement>(CONFIG.rootSelector);

  const openPopover = getOpenPoppable(CONFIG);
  if (e.key === "Escape" && openPopover) {
    e.preventDefault();
    const trigger = openPopover.querySelector<HTMLElement>(CONFIG.triggerSelector);
    close(openPopover);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(CONFIG.triggerSelector)
  ) {
    e.preventDefault();
    if (popover) toggle(popover);
    return;
  }

  if (e.key === "Tab" && openPopover) {
    const content = openPopover.querySelector<HTMLElement>(CONFIG.contentSelector);
    if (!content) return;

    const focusable = getFocusableElements(content);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
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
