// Starting Point UI Tooltip Module
//
// Tooltips open on hover/focus and never move focus or intercept clicks.
// Triggers are discovered via aria-describedby pointing at a `.tooltip`.

import { type Placement } from "@floating-ui/dom";
import {
  closeAnchor,
  getAnchorTrigger,
  getOpenAnchor,
  openAnchor,
  positionFloating,
  type AnchorOptions,
} from "./floating";

const CONTENT_SELECTOR = ".tooltip";

function getOrCreateArrow(content: HTMLElement): HTMLElement {
  let arrowEl = content.querySelector<HTMLElement>(".tooltip-arrow");
  if (!arrowEl) {
    arrowEl = document.createElement("div");
    arrowEl.className = "tooltip-arrow";
    content.appendChild(arrowEl);
  }
  return arrowEl;
}

const OPTS: AnchorOptions = {
  contentSelector: CONTENT_SELECTOR,
  triggerSelector: ":not(*)", // discovered via aria-describedby instead
  ariaExpanded: false,
  position: async (trigger, content) => {
    await positionFloating(trigger, content, {
      placement: (content.dataset.spPlacement as Placement) || "top",
      offset: 8,
      arrow: getOrCreateArrow(content),
    });
  },
};

function getTooltipFor(trigger: HTMLElement): HTMLElement | null {
  // aria-describedby may list multiple ids; pick the first that's a tooltip.
  const describedBy = trigger.getAttribute("aria-describedby");
  if (!describedBy) return null;
  for (const id of describedBy.split(/\s+/).filter(Boolean)) {
    const el = document.getElementById(id);
    if (el?.matches(CONTENT_SELECTOR)) return el;
  }
  return null;
}

function findTooltipTrigger(target: HTMLElement | null): {
  trigger: HTMLElement;
  content: HTMLElement;
} | null {
  let el: HTMLElement | null = target;
  while (el) {
    if (el.hasAttribute("aria-describedby")) {
      const content = getTooltipFor(el);
      if (content) return { trigger: el, content };
    }
    el = el.parentElement;
  }
  return null;
}

function handlePointerOver(e: PointerEvent) {
  const found = findTooltipTrigger(e.target as HTMLElement);
  if (!found) return;
  openAnchor(found.trigger, found.content, OPTS, { viaClick: false });
}

function handlePointerOut(e: PointerEvent) {
  // Touch pointerout fires on tap-end, not hover-leave. Ignore.
  if (e.pointerType === "touch") return;

  const target = e.target as HTMLElement;
  const related = e.relatedTarget as HTMLElement | null;

  const fromTrigger = findTooltipTrigger(target);
  if (fromTrigger) {
    if (
      related &&
      (fromTrigger.trigger.contains(related) ||
        fromTrigger.content.contains(related))
    ) {
      return;
    }
    if (fromTrigger.content.classList.contains("open")) {
      closeAnchor(fromTrigger.content, OPTS);
    }
    return;
  }

  const content = target.closest<HTMLElement>(CONTENT_SELECTOR);
  if (content) {
    const associatedTrigger = getAnchorTrigger(content);
    if (
      related &&
      (content.contains(related) ||
        (associatedTrigger && associatedTrigger.contains(related)))
    ) {
      return;
    }
    if (content.classList.contains("open")) closeAnchor(content, OPTS);
  }
}

function handleFocusIn(e: FocusEvent) {
  const found = findTooltipTrigger(e.target as HTMLElement);
  if (!found) return;
  openAnchor(found.trigger, found.content, OPTS, { viaClick: false });
}

function handleFocusOut(e: FocusEvent) {
  const target = e.target as HTMLElement;
  const related = e.relatedTarget as HTMLElement | null;

  const fromTrigger = findTooltipTrigger(target);
  if (!fromTrigger) return;

  if (
    related &&
    (fromTrigger.trigger.contains(related) ||
      fromTrigger.content.contains(related))
  ) {
    return;
  }

  if (fromTrigger.content.classList.contains("open")) {
    closeAnchor(fromTrigger.content, OPTS);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape") return;
  const openContent = getOpenAnchor(OPTS);
  if (!openContent) return;
  e.preventDefault();
  closeAnchor(openContent, OPTS);
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("pointerover", handlePointerOver);
  document.addEventListener("pointerout", handlePointerOut);
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("keydown", handleKeydown);
})();
