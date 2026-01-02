// Starting Point UI Accordion Module

import { findNextEnabled, isDisabled, waitForAnimations } from "./utils";

function getPanel(target: HTMLElement): HTMLElement | null {
  if (target.classList.contains("accordion-panel")) return target;
  return target.querySelector(".accordion-panel");
}

function getTrigger(panelId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-sp-target="#${panelId}"]`);
}

function setContentHeight(panel: HTMLElement) {
  const height = `${panel.scrollHeight}px`;
  panel.style.setProperty("--radix-accordion-content-height", height);
}

export function open(target: HTMLElement) {
  const panel = getPanel(target);
  if (!panel || panel.classList.contains("open")) return;

  if (panel.id) {
    const trigger = getTrigger(panel.id);
    trigger?.setAttribute("aria-expanded", "true");
  }

  setContentHeight(panel);
  panel.classList.add("open");
  panel.setAttribute("data-state", "open");
}

export async function close(target: HTMLElement) {
  const panel = getPanel(target);
  if (!panel || !panel.classList.contains("open")) return;

  if (panel.id) {
    const trigger = getTrigger(panel.id);
    trigger?.setAttribute("aria-expanded", "false");
  }

  setContentHeight(panel);
  panel.setAttribute("data-state", "closed");
  await waitForAnimations([panel]);

  panel.classList.remove("open");
  panel.removeAttribute("data-state");
}

export function toggle(target: HTMLElement) {
  const panel = getPanel(target);
  if (!panel) return;

  if (panel.classList.contains("open")) {
    close(target);
  } else {
    open(target);
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const trigger = target.closest<HTMLElement>("[data-sp-toggle='accordion']");
  if (!trigger || isDisabled(trigger)) return;

  const selector = trigger.dataset.spTarget;
  if (!selector) return;

  const panel = document.querySelector<HTMLElement>(selector);
  if (!panel) return;

  const accordion = trigger.closest<HTMLElement>(".accordion");
  const isOpen = panel.classList.contains("open");

  // Close other panels in the same accordion (unless data-sp-multiple is set)
  if (accordion && !accordion.hasAttribute("data-sp-multiple")) {
    const otherPanels = accordion.querySelectorAll<HTMLElement>(
      ".accordion-panel.open"
    );
    for (const otherPanel of otherPanels) {
      if (otherPanel !== panel) {
        close(otherPanel);
      }
    }
  }

  if (isOpen) {
    close(panel);
  } else {
    open(panel);
  }
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>("[data-sp-toggle='accordion']");
  if (!trigger) return;

  const accordion = trigger.closest<HTMLElement>(".accordion");
  if (!accordion) return;

  const triggers = [
    ...accordion.querySelectorAll<HTMLElement>("[data-sp-toggle='accordion']"),
  ];
  const currentIndex = triggers.indexOf(trigger);

  let nextTrigger: HTMLElement | null = null;

  switch (e.key) {
    case "ArrowDown":
      nextTrigger = findNextEnabled(triggers, currentIndex, 1);
      break;
    case "ArrowUp":
      nextTrigger = findNextEnabled(triggers, currentIndex, -1);
      break;
    case "Home":
      nextTrigger = triggers.find((t) => !isDisabled(t)) ?? null;
      break;
    case "End":
      nextTrigger = [...triggers].reverse().find((t) => !isDisabled(t)) ?? null;
      break;
  }

  if (nextTrigger) {
    e.preventDefault();
    nextTrigger.focus();
  }
}

// Initialize global listeners
let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
})();
