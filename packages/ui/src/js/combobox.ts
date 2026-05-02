// Starting Point UI Combobox Module

import { type Placement } from "@floating-ui/dom";
import {
  closeAnchor,
  closeAnchorIfOutside,
  getAnchorTrigger,
  getOpenAnchor,
  getTargetContent,
  openAnchor,
  positionFloating,
  toggleAnchor,
  type AnchorOptions,
} from "./floating";
import { isDisabled } from "./utils";

const TRIGGER_SELECTOR = "[data-sp-toggle='combobox']";
const CONTENT_SELECTOR = ".combobox";

function getVisibleItems(menu: HTMLElement): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(".combobox-item")].filter(
    (item) => !item.hidden && !isDisabled(item),
  );
}

export function filter(menu: HTMLElement, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const items = menu.querySelectorAll<HTMLElement>(".combobox-item");
  let visibleCount = 0;

  items.forEach((item) => {
    const text = (item.dataset.label ?? item.textContent ?? "")
      .trim()
      .toLowerCase();
    const matches = !normalizedQuery || text.includes(normalizedQuery);
    item.hidden = !matches;
    if (matches) visibleCount++;
  });

  const emptyEl = menu.querySelector<HTMLElement>(".combobox-empty");
  if (emptyEl) {
    emptyEl.classList.toggle("visible", visibleCount === 0);
  }
}

const OPTS: AnchorOptions = {
  contentSelector: CONTENT_SELECTOR,
  triggerSelector: TRIGGER_SELECTOR,
  position: async (trigger, menu) => {
    // Match menu width to trigger so options align with the value they populate.
    menu.style.width = `${trigger.offsetWidth}px`;
    await positionFloating(trigger, menu, {
      placement: (trigger.dataset.spPlacement as Placement) || "bottom-start",
      offset: parseInt(trigger.dataset.spOffset || "4", 10),
    });
  },
  onAfterClose: (_trigger, menu) => {
    filter(menu, "");
    const input = menu.querySelector<HTMLInputElement>(".combobox-input");
    if (input) input.value = "";
  },
};

export const open = (trigger: HTMLElement) => {
  const menu = getTargetContent(trigger);
  if (menu) openAnchor(trigger, menu, OPTS, { viaClick: true });
};
export const close = (menu: HTMLElement) => closeAnchor(menu, OPTS);
export const toggle = (trigger: HTMLElement) => {
  const menu = getTargetContent(trigger);
  if (menu) toggleAnchor(trigger, menu, OPTS, { viaClick: true });
};

function updateTriggerText(trigger: HTMLElement, menu: HTMLElement) {
  const checked = menu.querySelectorAll<HTMLInputElement>(
    ".combobox-item input:checked",
  );
  const valueEl = trigger.querySelector<HTMLElement>(".combobox-value");
  if (!valueEl) return;

  if (checked.length === 0) {
    if (valueEl.dataset.placeholder) {
      valueEl.textContent = valueEl.dataset.placeholder;
      valueEl.removeAttribute("data-placeholder");
    }
  } else {
    if (!valueEl.dataset.placeholder) {
      valueEl.dataset.placeholder = valueEl.textContent ?? "";
    }
    if (checked.length === 1) {
      valueEl.textContent =
        checked[0].closest<HTMLElement>(".combobox-item")?.textContent?.trim() ??
        "";
    } else {
      const name = checked[0].name ?? "items";
      valueEl.textContent = `${checked.length} ${name} selected`;
    }
  }
}

export function select(trigger: HTMLElement, menu: HTMLElement, item: HTMLElement) {
  const input = item.querySelector<HTMLInputElement>("input");
  const isMultiple = input?.type === "checkbox";

  if (isMultiple) {
    if (input) {
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    item.setAttribute("aria-selected", String(input?.checked ?? false));
    updateTriggerText(trigger, menu);
  } else {
    menu.querySelectorAll<HTMLElement>(".combobox-item").forEach((el) => {
      el.setAttribute("aria-selected", "false");
    });
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    item.setAttribute("aria-selected", "true");
    updateTriggerText(trigger, menu);
    closeAnchor(menu, OPTS);
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const trigger = target.closest<HTMLElement>(TRIGGER_SELECTOR);
  if (trigger) {
    const menu = getTargetContent(trigger);
    if (menu) {
      e.preventDefault();
      toggleAnchor(trigger, menu, OPTS, { viaClick: true });
    }
    return;
  }

  const item = target.closest<HTMLElement>(".combobox-item");
  if (item) {
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    const menu = item.closest<HTMLElement>(CONTENT_SELECTOR);
    if (menu) {
      const associatedTrigger = getAnchorTrigger(menu);
      if (associatedTrigger) select(associatedTrigger, menu, item);
    }
    return;
  }

  closeAnchorIfOutside(target, OPTS);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;

  const openMenu = getOpenAnchor(OPTS);
  if (e.key === "Escape" && openMenu) {
    e.preventDefault();
    const trigger = getAnchorTrigger(openMenu);
    closeAnchor(openMenu, OPTS);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(TRIGGER_SELECTOR)
  ) {
    e.preventDefault();
    const menu = getTargetContent(target);
    if (menu) toggleAnchor(target, menu, OPTS, { viaClick: true });
    return;
  }

  const menu =
    target.closest<HTMLElement>(CONTENT_SELECTOR) ??
    (target.matches(TRIGGER_SELECTOR) ? getTargetContent(target) : null);
  if (!menu?.classList.contains("open")) return;

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(".combobox-item")
  ) {
    e.preventDefault();
    if (!isDisabled(target)) {
      const trigger = getAnchorTrigger(menu);
      if (trigger) select(trigger, menu, target);
    }
    return;
  }

  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const items = getVisibleItems(menu);
    if (!items.length) return;

    const currentIndex = items.indexOf(target);
    let nextItem: HTMLElement | null = null;

    switch (e.key) {
      case "ArrowDown":
        nextItem =
          currentIndex < 0 ? items[0] : items[currentIndex + 1] ?? items[0];
        break;
      case "ArrowUp":
        nextItem =
          currentIndex < 0
            ? items[items.length - 1]
            : items[currentIndex - 1] ?? items[items.length - 1];
        break;
      case "Home":
        nextItem = items[0];
        break;
      case "End":
        nextItem = items[items.length - 1];
        break;
    }

    nextItem?.focus();
  }
}

function handleFocusOut(e: FocusEvent) {
  closeAnchorIfOutside(e.relatedTarget as HTMLElement | null, OPTS);
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.matches(".combobox-input")) return;

  const menu = input.closest<HTMLElement>(CONTENT_SELECTOR);
  if (menu) filter(menu, input.value);
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("input", handleInput);
})();
