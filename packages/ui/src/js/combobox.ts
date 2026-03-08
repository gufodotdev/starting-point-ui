// Starting Point UI Combobox Module

import {
  computePosition,
  flip,
  shift,
  offset,
  type Placement,
} from "@floating-ui/dom";
import { isDisabled, waitForAnimations } from "./utils";

function getMenu(combobox: HTMLElement): HTMLElement | null {
  return combobox.querySelector(".combobox-menu");
}

function getTrigger(combobox: HTMLElement): HTMLElement | null {
  return combobox.querySelector("[data-sp-toggle='combobox']");
}

function getInput(combobox: HTMLElement): HTMLInputElement | null {
  return combobox.querySelector(".combobox-input");
}

function getOpenCombobox(): HTMLElement | null {
  const openMenu = document.querySelector(".combobox-menu.open");
  return openMenu?.closest(".combobox") ?? null;
}

function getVisibleItems(menu: HTMLElement): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(".combobox-item")].filter(
    (item) => !item.hidden && !isDisabled(item),
  );
}

async function positionMenu(combobox: HTMLElement) {
  const trigger = getTrigger(combobox);
  const menu = getMenu(combobox);
  if (!trigger || !menu) return;

  const placement =
    (combobox.dataset.spPlacement as Placement) || "bottom-start";
  const offsetValue = parseInt(combobox.dataset.spOffset || "4", 10);

  const { x, y } = await computePosition(trigger, menu, {
    placement,
    middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
  });

  Object.assign(menu.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}

export async function open(combobox: HTMLElement) {
  const menu = getMenu(combobox);
  if (!menu || menu.classList.contains("open")) return;

  const openCombobox = getOpenCombobox();
  if (openCombobox && openCombobox !== combobox) {
    close(openCombobox);
  }

  const trigger = getTrigger(combobox);

  menu.classList.add("open");
  trigger?.setAttribute("aria-expanded", "true");
  menu.setAttribute("data-state", "open");

  positionMenu(combobox);

  const input = getInput(combobox);
  input?.focus();
}

export async function close(combobox: HTMLElement) {
  const menu = getMenu(combobox);
  if (!menu || !menu.classList.contains("open")) return;

  const trigger = getTrigger(combobox);

  trigger?.setAttribute("aria-expanded", "false");
  menu.setAttribute("data-state", "closed");

  await waitForAnimations([menu]);

  menu.classList.remove("open");
  menu.removeAttribute("data-state");

  filter(combobox, "");
  const input = getInput(combobox);
  if (input) input.value = "";
}

export function toggle(combobox: HTMLElement) {
  const menu = getMenu(combobox);
  if (menu?.classList.contains("open")) {
    close(combobox);
  } else {
    open(combobox);
  }
}

function updateTriggerText(combobox: HTMLElement) {
  const menu = getMenu(combobox);
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
    const menu = getMenu(combobox);
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

export function filter(combobox: HTMLElement, query: string) {
  const menu = getMenu(combobox);
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

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  const toggleBtn = target.closest<HTMLElement>("[data-sp-toggle='combobox']");
  if (toggleBtn) {
    const combobox = toggleBtn.closest<HTMLElement>(".combobox");
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
    const combobox = item.closest<HTMLElement>(".combobox");
    if (combobox) {
      select(combobox, item);
    }
    return;
  }

  const openCombobox = getOpenCombobox();
  if (openCombobox) {
    const menu = getMenu(openCombobox);
    if (menu && !openCombobox.contains(target)) {
      close(openCombobox);
    }
  }
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const combobox = target.closest<HTMLElement>(".combobox");

  const openCombobox = getOpenCombobox();

  if (e.key === "Escape" && openCombobox) {
    e.preventDefault();
    const trigger = getTrigger(openCombobox);
    close(openCombobox);
    trigger?.focus();
    return;
  }

  if (
    (e.key === "Enter" || e.key === " ") &&
    target.matches("[data-sp-toggle='combobox']")
  ) {
    e.preventDefault();
    if (combobox) {
      toggle(combobox);
    }
    return;
  }

  if (!combobox) return;
  const menu = getMenu(combobox);
  if (!menu?.classList.contains("open")) return;

  if ((e.key === "Enter" || e.key === " ") && target.matches(".combobox-item")) {
    e.preventDefault();
    if (!isDisabled(target)) {
      select(combobox, target);
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
          currentIndex < 0 ? items[0] : (items[currentIndex + 1] ?? items[0]);
        break;
      case "ArrowUp":
        nextItem =
          currentIndex < 0
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
  const openCombobox = getOpenCombobox();
  if (!openCombobox) return;

  const relatedTarget = e.relatedTarget as HTMLElement | null;
  const menu = getMenu(openCombobox);

  if (
    !relatedTarget ||
    (!openCombobox.contains(relatedTarget) && !menu?.contains(relatedTarget))
  ) {
    close(openCombobox);
  }
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.matches(".combobox-input")) return;

  const combobox = input.closest<HTMLElement>(".combobox");
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
