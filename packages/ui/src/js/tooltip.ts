// Starting Point UI Tooltip Module

import { type Placement } from "@floating-ui/dom";
import {
  closePoppable,
  getOpenPoppable,
  openPoppable,
  positionFloating,
  type PoppableConfig,
} from "./utils";

function getOrCreateArrow(content: HTMLElement): HTMLElement {
  let arrowEl = content.querySelector<HTMLElement>(".tooltip-arrow");
  if (!arrowEl) {
    arrowEl = document.createElement("div");
    arrowEl.className = "tooltip-arrow";
    content.appendChild(arrowEl);
  }
  return arrowEl;
}

const CONFIG: PoppableConfig = {
  rootSelector: ".tooltip",
  contentSelector: ".tooltip-content",
  triggerSelector: "[data-sp-toggle='tooltip']",
  ariaExpanded: false,
  position: async (root, trigger, content) => {
    await positionFloating(trigger, content, {
      placement: (root.dataset.spPlacement as Placement) || "top",
      offset: 8,
      arrow: getOrCreateArrow(content),
    });
  },
};

const open = (tooltip: HTMLElement) => openPoppable(tooltip, CONFIG);
const close = (tooltip: HTMLElement) => closePoppable(tooltip, CONFIG);

function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>(CONFIG.triggerSelector);
  if (!trigger) return;

  const tooltip = trigger.closest<HTMLElement>(CONFIG.rootSelector);
  if (tooltip) open(tooltip);
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const tooltip = target.closest<HTMLElement>(CONFIG.rootSelector);
  if (!tooltip) return;

  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !tooltip.contains(related)) {
    close(tooltip);
  }
}

function handleFocusIn(e: FocusEvent) {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>(CONFIG.triggerSelector);
  if (!trigger) return;

  const tooltip = trigger.closest<HTMLElement>(CONFIG.rootSelector);
  if (tooltip) open(tooltip);
}

function handleFocusOut(e: FocusEvent) {
  const target = e.target as HTMLElement;
  const tooltip = target.closest<HTMLElement>(CONFIG.rootSelector);
  if (!tooltip) return;

  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !tooltip.contains(related)) {
    close(tooltip);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape") return;

  const openTooltip = getOpenPoppable(CONFIG);
  if (!openTooltip) return;

  e.preventDefault();
  const trigger = openTooltip.querySelector<HTMLElement>(CONFIG.triggerSelector);
  close(openTooltip);
  trigger?.focus();
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("keydown", handleKeydown);
})();
