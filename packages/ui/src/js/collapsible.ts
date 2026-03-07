// Starting Point UI Collapsible Module

import { waitForAnimations } from "./utils";

function getPanel(target: HTMLElement): HTMLElement | null {
  if (target.classList.contains("collapsible-panel")) return target;
  return target.querySelector(".collapsible-panel");
}

function getTrigger(panelId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-sp-target="#${panelId}"]`);
}

function setContentHeight(panel: HTMLElement) {
  const height = `${panel.scrollHeight}px`;
  panel.style.setProperty("--radix-collapsible-content-height", height);
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

  const trigger = target.closest<HTMLElement>("[data-sp-toggle='collapsible']");
  if (!trigger) return;

  const selector = trigger.dataset.spTarget;
  if (!selector) return;

  const panel = document.querySelector<HTMLElement>(selector);
  if (panel) {
    toggle(panel);
  }
}

// Initialize global listeners
let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
})();
