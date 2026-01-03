// Starting Point UI Sidebar Module

import { waitForAnimations } from "./utils";

function getBreakpoint(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--breakpoint-sidebar"
  );
  return parseInt(value, 10) || 1024;
}

function isMobile(): boolean {
  return window.innerWidth < getBreakpoint();
}

function getBackdrop(sidebarPanel: HTMLElement): HTMLElement | null {
  const layout = sidebarPanel.closest(".sidebar");
  return layout?.querySelector(".sidebar-backdrop") ?? null;
}

function getAnimatableElements(sidebarPanel: HTMLElement): HTMLElement[] {
  const elements: HTMLElement[] = [sidebarPanel];
  const backdrop = getBackdrop(sidebarPanel);
  if (backdrop) {
    elements.push(backdrop);
  }
  return elements;
}

function setOpenClass(elements: HTMLElement[], isOpen: boolean) {
  for (const el of elements) {
    if (isOpen) {
      el.classList.add("open");
    } else {
      el.classList.remove("open");
    }
  }
}

function setDataState(
  elements: HTMLElement[],
  state: "open" | "closed" | null
) {
  for (const el of elements) {
    if (state === null) {
      el.removeAttribute("data-state");
    } else {
      el.setAttribute("data-state", state);
    }
  }
}

export function open(sidebarPanel: HTMLElement) {
  if (isMobile()) {
    const elements = getAnimatableElements(sidebarPanel);
    setOpenClass(elements, true);
    setDataState(elements, "open");
  } else {
    sidebarPanel.classList.remove("collapsed");
  }
}

export async function close(sidebarPanel: HTMLElement) {
  if (isMobile()) {
    const elements = getAnimatableElements(sidebarPanel);
    setDataState(elements, "closed");

    await waitForAnimations(elements);

    setOpenClass(elements, false);
    setDataState(elements, null);
  } else {
    sidebarPanel.classList.add("collapsed");
  }
}

export function toggle(sidebarPanel: HTMLElement) {
  if (isMobile()) {
    const isOpen = sidebarPanel.classList.contains("open");
    if (isOpen) {
      close(sidebarPanel);
    } else {
      open(sidebarPanel);
    }
  } else {
    const isCollapsed = sidebarPanel.classList.contains("collapsed");
    if (isCollapsed) {
      open(sidebarPanel);
    } else {
      close(sidebarPanel);
    }
  }
}

// Global click handler
function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // Handle toggle button clicks
  const toggleBtn = target.closest<HTMLElement>("[data-sp-toggle='sidebar']");
  if (toggleBtn) {
    const selector = toggleBtn.dataset.spTarget;
    if (selector) {
      const sidebarPanel = document.querySelector<HTMLElement>(selector);
      if (sidebarPanel) {
        toggle(sidebarPanel);
      }
    }
    return;
  }

  // Handle backdrop clicks (close any open sidebar panel)
  if (target.classList.contains("sidebar-backdrop")) {
    const layout = target.closest(".sidebar");
    const openPanel = layout?.querySelector<HTMLElement>(".sidebar-panel.open");
    if (openPanel) {
      close(openPanel);
    }
  }
}

// Global keyboard handler
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    const openPanel = document.querySelector<HTMLElement>(
      ".sidebar-panel.open"
    );
    if (openPanel) {
      e.preventDefault();
      close(openPanel);
    }
  }
}

// Handle window resize to clean up mobile state when transitioning to desktop
function handleResize() {
  if (!isMobile()) {
    // Clean up any open mobile sidebars
    const openPanels = document.querySelectorAll<HTMLElement>(
      ".sidebar-panel.open"
    );
    openPanels.forEach((sidebarPanel) => {
      const elements = getAnimatableElements(sidebarPanel);
      setOpenClass(elements, false);
      setDataState(elements, null);
    });
  }
}

// Initialize global listeners
let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);
})();
