// Starting Point UI Tabs Module

export function select(tab: HTMLElement) {
  if (tab.hasAttribute("disabled")) return;

  const tabList = tab.closest(".tab-list");
  if (!tabList) return;

  // Deselect all tabs in the list
  const tabs = tabList.querySelectorAll<HTMLElement>(".tab");
  for (const t of tabs) {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
    t.setAttribute("tabindex", "-1");
    const selector = t.dataset.spTarget;
    if (selector) {
      document.querySelector(selector)?.classList.remove("active");
    }
  }

  // Select the clicked tab
  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  tab.setAttribute("tabindex", "0");

  const selector = tab.dataset.spTarget;
  if (selector) {
    document.querySelector(selector)?.classList.add("active");
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const tab = target.closest<HTMLElement>("[data-sp-toggle='tab']");
  if (tab) {
    select(tab);
  }
}

function findNextEnabledTab(
  tabs: HTMLElement[],
  startIndex: number,
  direction: 1 | -1
): HTMLElement | null {
  const len = tabs.length;
  for (let i = 1; i <= len; i++) {
    const index = (startIndex + i * direction + len) % len;
    if (!tabs[index].hasAttribute("disabled")) {
      return tabs[index];
    }
  }
  return null;
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("tab")) return;

  const tabList = target.closest(".tab-list");
  if (!tabList) return;

  const tabs = [...tabList.querySelectorAll<HTMLElement>(".tab")];
  const currentIndex = tabs.indexOf(target);

  let nextTab: HTMLElement | null = null;

  switch (e.key) {
    case "ArrowLeft":
      nextTab = findNextEnabledTab(tabs, currentIndex, -1);
      break;
    case "ArrowRight":
      nextTab = findNextEnabledTab(tabs, currentIndex, 1);
      break;
    case "Home":
      nextTab = tabs.find((t) => !t.hasAttribute("disabled")) ?? null;
      break;
    case "End":
      nextTab = [...tabs].reverse().find((t) => !t.hasAttribute("disabled")) ?? null;
      break;
  }

  if (nextTab) {
    e.preventDefault();
    nextTab.focus();
    select(nextTab);
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
