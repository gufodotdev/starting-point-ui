// Starting Point UI Popover Module

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

const TRIGGER_SELECTOR = "[data-sp-toggle='popover']";
const CONTENT_SELECTOR = ".popover";

const OPTS: AnchorOptions = {
  contentSelector: CONTENT_SELECTOR,
  triggerSelector: TRIGGER_SELECTOR,
  position: async (trigger, content) => {
    await positionFloating(trigger, content, {
      placement: (trigger.dataset.spPlacement as Placement) || "bottom",
      offset: parseInt(trigger.dataset.spOffset || "4", 10),
    });
  },
};

export const open = (trigger: HTMLElement) => {
  const content = getTargetContent(trigger);
  if (content) openAnchor(trigger, content, OPTS, { viaClick: true });
};
export const close = (content: HTMLElement) => closeAnchor(content, OPTS);
export const toggle = (trigger: HTMLElement) => {
  const content = getTargetContent(trigger);
  if (content) toggleAnchor(trigger, content, OPTS, { viaClick: true });
};

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const trigger = target.closest<HTMLElement>(TRIGGER_SELECTOR);
  if (trigger) {
    const content = getTargetContent(trigger);
    if (content) {
      e.preventDefault();
      toggleAnchor(trigger, content, OPTS, { viaClick: true });
    }
    return;
  }

  closeAnchorIfOutside(target, OPTS);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;

  const openContent = getOpenAnchor(OPTS);
  if (e.key === "Escape" && openContent) {
    e.preventDefault();
    const trigger = getAnchorTrigger(openContent);
    closeAnchor(openContent, OPTS);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(TRIGGER_SELECTOR)
  ) {
    e.preventDefault();
    const content = getTargetContent(target);
    if (content) toggleAnchor(target, content, OPTS, { viaClick: true });
  }
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
