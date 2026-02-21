// Starting Point UI Dropdown Module

import {
  computePosition,
  flip,
  shift,
  offset,
  type Placement,
} from "@floating-ui/dom";
import { findNextEnabled, isDisabled, waitForAnimations } from "./utils";

function getMenu(dropdown: HTMLElement): HTMLElement | null {
  return dropdown.querySelector(".dropdown-menu");
}

function getTrigger(dropdown: HTMLElement): HTMLElement | null {
  return dropdown.querySelector("[data-sp-toggle='dropdown']");
}

function getOpenDropdown(): HTMLElement | null {
  const openMenu = document.querySelector(".dropdown-menu.open");
  return openMenu?.closest(".dropdown") ?? null;
}

async function positionMenu(dropdown: HTMLElement) {
  const trigger = getTrigger(dropdown);
  const menu = getMenu(dropdown);
  if (!trigger || !menu) return;

  const placement = (dropdown.dataset.spPlacement as Placement) || "bottom-end";
  const offsetValue = parseInt(dropdown.dataset.spOffset || "4", 10);

  const { x, y } = await computePosition(trigger, menu, {
    placement,
    middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
  });

  Object.assign(menu.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}

export function open(dropdown: HTMLElement) {
  const menu = getMenu(dropdown);
  if (!menu || menu.classList.contains("open")) return;

  // Close any other open dropdown first
  const openDropdown = getOpenDropdown();
  if (openDropdown) {
    close(openDropdown);
  }

  const trigger = getTrigger(dropdown);

  menu.classList.add("open");
  trigger?.setAttribute("aria-expanded", "true");
  menu.setAttribute("data-state", "open");

  positionMenu(dropdown);
}

export async function close(dropdown: HTMLElement) {
  const menu = getMenu(dropdown);
  if (!menu || !menu.classList.contains("open")) return;

  const trigger = getTrigger(dropdown);

  trigger?.setAttribute("aria-expanded", "false");
  menu.setAttribute("data-state", "closed");

  await waitForAnimations([menu]);

  menu.classList.remove("open");
  menu.removeAttribute("data-state");
}

export function toggle(dropdown: HTMLElement) {
  const menu = getMenu(dropdown);
  if (menu?.classList.contains("open")) {
    close(dropdown);
  } else {
    open(dropdown);
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // Handle toggle button clicks
  const toggleBtn = target.closest<HTMLElement>("[data-sp-toggle='dropdown']");
  if (toggleBtn) {
    const dropdown = toggleBtn.closest<HTMLElement>(".dropdown");
    if (dropdown) {
      e.preventDefault();
      toggle(dropdown);
    }
    return;
  }

  // Handle item clicks
  const item = target.closest<HTMLElement>(".dropdown-item");
  if (item) {
    // Ignore disabled items
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    const dropdown = item.closest<HTMLElement>(".dropdown");
    if (dropdown) {
      close(dropdown);
    }
    return;
  }

  // Close dropdown when clicking outside
  const openDropdown = getOpenDropdown();
  if (openDropdown && !openDropdown.contains(target)) {
    close(openDropdown);
  }
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const dropdown = target.closest<HTMLElement>(".dropdown");

  // Handle Escape to close
  const openDropdown = getOpenDropdown();
  if (e.key === "Escape" && openDropdown) {
    e.preventDefault();
    const trigger = getTrigger(openDropdown);
    close(openDropdown);
    trigger?.focus();
    return;
  }

  // Handle Enter/Space on trigger
  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches("[data-sp-toggle='dropdown']")
  ) {
    e.preventDefault();
    if (dropdown) {
      toggle(dropdown);
    }
    return;
  }

  // Handle arrow navigation within menu
  const menu = dropdown ? getMenu(dropdown) : null;
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
        nextItem =
          [...items].reverse().find((item) => !isDisabled(item)) ?? null;
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

  if (nextItem) {
    nextItem.focus();
  }
}

function handleFocusOut(e: FocusEvent) {
  const openDropdown = getOpenDropdown();
  if (!openDropdown) return;

  const relatedTarget = e.relatedTarget as HTMLElement | null;

  // If focus is moving outside the dropdown, close it
  if (!relatedTarget || !openDropdown.contains(relatedTarget)) {
    close(openDropdown);
  }
}

// Initialize global listeners
let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("focusout", handleFocusOut);
})();
