// Starting Point UI Tooltip Module

import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  type Placement,
} from "@floating-ui/dom";
import { waitForAnimations } from "./utils";

const STATIC_SIDE: Record<string, string> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

function getContent(tooltip: HTMLElement): HTMLElement | null {
  return tooltip.querySelector(".tooltip-content");
}

function getOrCreateArrow(content: HTMLElement): HTMLElement {
  let arrowEl = content.querySelector<HTMLElement>(".tooltip-arrow");
  if (!arrowEl) {
    arrowEl = document.createElement("div");
    arrowEl.className = "tooltip-arrow";
    content.appendChild(arrowEl);
  }
  return arrowEl;
}

function getTrigger(tooltip: HTMLElement): HTMLElement | null {
  return tooltip.querySelector("[data-sp-toggle='tooltip']");
}

function getOpenTooltip(): HTMLElement | null {
  const openContent = document.querySelector(".tooltip-content.open");
  return openContent?.closest(".tooltip") ?? null;
}

async function positionContent(tooltip: HTMLElement) {
  const trigger = getTrigger(tooltip);
  const content = getContent(tooltip);
  if (!trigger || !content) return;

  const arrowEl = getOrCreateArrow(content);
  const placement =
    (tooltip.dataset.spPlacement as Placement) || "top";

  const result = await computePosition(trigger, content, {
    placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowEl, padding: 4 }),
    ],
  });

  Object.assign(content.style, {
    left: `${result.x}px`,
    top: `${result.y}px`,
  });

  if (result.middlewareData.arrow) {
    const { x, y } = result.middlewareData.arrow;
    const side = STATIC_SIDE[result.placement.split("-")[0]];

    Object.assign(arrowEl.style, {
      left: x != null ? `${x}px` : "",
      top: y != null ? `${y}px` : "",
      [side]: "-4px",
    });
  }
}

async function open(tooltip: HTMLElement) {
  const content = getContent(tooltip);
  if (!content || content.classList.contains("open")) return;

  const openTooltip = getOpenTooltip();
  if (openTooltip) {
    await close(openTooltip);
  }

  // Make the element measurable but invisible so position can be computed
  // before the tooltip becomes visible and the animation starts.
  content.style.visibility = "hidden";
  content.classList.add("open");

  await positionContent(tooltip);

  content.style.visibility = "";
  content.setAttribute("data-state", "open");
}

async function close(tooltip: HTMLElement) {
  const content = getContent(tooltip);
  if (!content || !content.classList.contains("open")) return;

  content.setAttribute("data-state", "closed");

  await waitForAnimations([content]);

  content.classList.remove("open");
  content.removeAttribute("data-state");
}

function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>("[data-sp-toggle='tooltip']");
  if (!trigger) return;

  const tooltip = trigger.closest<HTMLElement>(".tooltip");
  if (tooltip) {
    open(tooltip);
  }
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const tooltip = target.closest<HTMLElement>(".tooltip");
  if (!tooltip) return;

  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !tooltip.contains(related)) {
    close(tooltip);
  }
}

function handleFocusIn(e: FocusEvent) {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>("[data-sp-toggle='tooltip']");
  if (!trigger) return;

  const tooltip = trigger.closest<HTMLElement>(".tooltip");
  if (tooltip) {
    open(tooltip);
  }
}

function handleFocusOut(e: FocusEvent) {
  const target = e.target as HTMLElement;
  const tooltip = target.closest<HTMLElement>(".tooltip");
  if (!tooltip) return;

  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !tooltip.contains(related)) {
    close(tooltip);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape") return;

  const openTooltip = getOpenTooltip();
  if (!openTooltip) return;

  e.preventDefault();
  const trigger = getTrigger(openTooltip);
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
