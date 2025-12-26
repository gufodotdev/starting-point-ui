// Starting Point UI Dialog Module

import { getFocusableElements, waitForAnimations } from "./utils";

const BACKDROP_SELECTOR = ".dialog-backdrop, .sheet-backdrop";
const PANEL_SELECTOR = ".dialog-panel, .sheet-panel";

function getAnimatableElements(dialog: HTMLDialogElement): HTMLElement[] {
  return [
    ...dialog.querySelectorAll<HTMLElement>(
      `${BACKDROP_SELECTOR}, ${PANEL_SELECTOR}`
    ),
  ];
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

function isModal(dialog: HTMLDialogElement): boolean {
  return dialog.querySelector(BACKDROP_SELECTOR) !== null;
}

export function open(dialog: HTMLDialogElement) {
  dialog.show();
  const elements = getAnimatableElements(dialog);
  setDataState(elements, "open");

  // Focus first focusable element in modal dialogs
  if (isModal(dialog)) {
    const focusable = getFocusableElements(dialog);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }
}

export async function close(dialog: HTMLDialogElement) {
  const elements = getAnimatableElements(dialog);
  setDataState(elements, "closed");

  await waitForAnimations(elements);

  dialog.close();
  setDataState(elements, null);
}

export function toggle(dialog: HTMLDialogElement) {
  if (dialog.open) {
    close(dialog);
  } else {
    open(dialog);
  }
}

// Handle keydown for Escape and focus trapping
function handleKeydown(e: KeyboardEvent) {
  const dialogEl = (e.target as HTMLElement).closest<HTMLDialogElement>(
    "dialog"
  );
  if (!dialogEl?.open) return;

  // Handle Escape key
  if (e.key === "Escape") {
    e.preventDefault();
    const isStatic = dialogEl.dataset.spBackdrop === "static";
    if (!isStatic) {
      close(dialogEl);
    }
    return;
  }

  // Handle Tab key for focus trapping in modals
  if (e.key === "Tab" && isModal(dialogEl)) {
    const focusable = getFocusableElements(dialogEl);
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

// Global click handler for data attributes
function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // Handle toggle buttons
  const toggleBtn = target.closest<HTMLElement>("[data-sp-toggle='dialog']");
  if (toggleBtn) {
    const selector = toggleBtn.dataset.spTarget;
    if (selector) {
      const dialogEl = document.querySelector<HTMLDialogElement>(selector);
      if (dialogEl) {
        open(dialogEl);
      }
    }
    return;
  }

  // Handle dismiss buttons
  const dismissBtn = target.closest<HTMLElement>("[data-sp-dismiss='dialog']");
  if (dismissBtn) {
    const dialogEl = dismissBtn.closest<HTMLDialogElement>("dialog");
    if (dialogEl) {
      close(dialogEl);
    }
    return;
  }

  // Handle backdrop clicks
  const backdrop = target.closest<HTMLElement>(BACKDROP_SELECTOR);
  if (backdrop) {
    const dialogEl = backdrop.closest<HTMLDialogElement>("dialog");
    if (dialogEl) {
      // Static backdrop prevents closing via click
      const isStatic = dialogEl.dataset.spBackdrop === "static";
      if (!isStatic) {
        close(dialogEl);
      }
    }
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
