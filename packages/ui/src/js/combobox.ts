// Starting Point UI Combobox Module

import { type Placement } from "@floating-ui/dom";
import {
  closeIfOutside,
  closePoppable,
  getOpenPoppable,
  isDisabled,
  openPoppable,
  positionFloating,
  togglePoppable,
  type PoppableConfig,
} from "./utils";

function getVisibleItems(menu: HTMLElement): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(".combobox-item")].filter(
    (item) => !item.hidden && !isDisabled(item),
  );
}

export function filter(combobox: HTMLElement, query: string) {
  const menu = combobox.querySelector<HTMLElement>(".combobox-menu");
  if (!menu) return;

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

const CONFIG: PoppableConfig = {
  rootSelector: ".combobox",
  contentSelector: ".combobox-menu",
  triggerSelector: "[data-sp-toggle='combobox']",
  position: async (root, trigger, menu) => {
    await positionFloating(trigger, menu, {
      placement: (root.dataset.spPlacement as Placement) || "bottom-start",
      offset: parseInt(root.dataset.spOffset || "4", 10),
    });
  },
  onAfterOpen: (root) => {
    root.querySelector<HTMLInputElement>(".combobox-input")?.focus();
  },
  onAfterClose: (root) => {
    filter(root, "");
    const input = root.querySelector<HTMLInputElement>(".combobox-input");
    if (input) input.value = "";
  },
};

export const open = (combobox: HTMLElement) => openPoppable(combobox, CONFIG);
export const close = (combobox: HTMLElement) => closePoppable(combobox, CONFIG);
export const toggle = (combobox: HTMLElement) => togglePoppable(combobox, CONFIG);

function updateTriggerText(combobox: HTMLElement) {
  const menu = combobox.querySelector<HTMLElement>(CONFIG.contentSelector);
  if (!menu) return;

  const checked = menu.querySelectorAll<HTMLInputElement>(".combobox-item input:checked");
  const valueEl = combobox.querySelector<HTMLElement>(".combobox-value");
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
      valueEl.textContent = checked[0].closest<HTMLElement>(".combobox-item")?.textContent?.trim() ?? "";
    } else {
      const name = checked[0].name ?? "items";
      valueEl.textContent = `${checked.length} ${name} selected`;
    }
  }
}

export function select(combobox: HTMLElement, item: HTMLElement) {
  const input = item.querySelector<HTMLInputElement>("input");
  const isMultiple = input?.type === "checkbox";

  if (isMultiple) {
    if (input) {
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    item.setAttribute("aria-selected", String(input?.checked ?? false));
    updateTriggerText(combobox);
  } else {
    const menu = combobox.querySelector<HTMLElement>(CONFIG.contentSelector);
    menu?.querySelectorAll<HTMLElement>(".combobox-item").forEach((el) => {
      el.setAttribute("aria-selected", "false");
    });
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    item.setAttribute("aria-selected", "true");
    updateTriggerText(combobox);
    close(combobox);
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const toggleBtn = target.closest<HTMLElement>(CONFIG.triggerSelector);
  if (toggleBtn) {
    const combobox = toggleBtn.closest<HTMLElement>(CONFIG.rootSelector);
    if (combobox) {
      e.preventDefault();
      toggle(combobox);
    }
    return;
  }

  const item = target.closest<HTMLElement>(".combobox-item");
  if (item) {
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    const combobox = item.closest<HTMLElement>(CONFIG.rootSelector);
    if (combobox) select(combobox, item);
    return;
  }

  closeIfOutside(target, CONFIG);
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const combobox = target.closest<HTMLElement>(CONFIG.rootSelector);

  const openCombobox = getOpenPoppable(CONFIG);

  if (e.key === "Escape" && openCombobox) {
    e.preventDefault();
    const trigger = openCombobox.querySelector<HTMLElement>(CONFIG.triggerSelector);
    close(openCombobox);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches(CONFIG.triggerSelector)
  ) {
    e.preventDefault();
    if (combobox) toggle(combobox);
    return;
  }

  if (!combobox) return;
  const menu = combobox.querySelector<HTMLElement>(CONFIG.contentSelector);
  if (!menu?.classList.contains("open")) return;

  if ((e.key === "Enter" || e.key === " ") && target.matches(".combobox-item")) {
    e.preventDefault();
    if (!isDisabled(target)) select(combobox, target);
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
        nextItem = currentIndex < 0 ? items[0] : (items[currentIndex + 1] ?? items[0]);
        break;
      case "ArrowUp":
        nextItem = currentIndex < 0
          ? items[items.length - 1]
          : (items[currentIndex - 1] ?? items[items.length - 1]);
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
  closeIfOutside(e.relatedTarget as HTMLElement | null, CONFIG);
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.matches(".combobox-input")) return;

  const combobox = input.closest<HTMLElement>(CONFIG.rootSelector);
  if (!combobox) return;

  filter(combobox, input.value);
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
