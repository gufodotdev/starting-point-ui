// Starting Point UI Utilities — generic DOM helpers shared across components.

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]:not([contenteditable='false'])",
  "audio[controls]",
  "video[controls]",
  "details > summary",
  "iframe",
].join(", ");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ].filter((el) => el.offsetParent !== null && el.tabIndex >= 0);
}

export async function waitForAnimations(
  elements: HTMLElement[],
): Promise<void> {
  const animations = elements.flatMap((el) => el.getAnimations());
  if (animations.length === 0) return;
  // Aborted animations reject with AbortError — we don't care, just stop waiting.
  await Promise.all(animations.map((a) => a.finished.catch(() => {})));
}

let idCounter = 0;

// The element's id, generating a fresh one only if it has none.
export function ensureId(el: HTMLElement, prefix = "sp"): string {
  if (!el.id) el.id = `${prefix}-${++idCounter}`;
  return el.id;
}

// The panel plus every open panel anchored to a trigger inside it, recursively
// (ClickToShow wires triggers to their panels via aria-controls). Dismiss
// mixins use this so a nested panel counts as inside its ancestors.
export function anchoredPanels(root: HTMLElement): HTMLElement[] {
  const panels = [root];
  for (let i = 0; i < panels.length; i++) {
    for (const trigger of panels[i].querySelectorAll('[aria-controls][aria-expanded="true"]')) {
      const panel = document.getElementById(trigger.getAttribute("aria-controls") as string);
      if (panel && !panels.includes(panel)) panels.push(panel);
    }
  }
  return panels;
}

// Point `attr` at the first element matching `selector` (by id), unless the
// author already set it. Used to wire aria-labelledby/describedby to a title.
export function linkAria(host: HTMLElement, selector: string, attr: string): void {
  if (host.hasAttribute(attr)) return;
  const target = host.querySelector<HTMLElement>(selector);
  if (target) host.setAttribute(attr, ensureId(target));
}

// Resolve a component's trigger element from its `toggle` config selector, once,
// caching it on the instance. Shared by the trigger mixins (click + hover) so
// each resolves the same element regardless of compose order.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveTrigger(instance: any): HTMLElement | null {
  if (instance.trigger === undefined) {
    const sel = instance.config.toggle as string | undefined;
    instance.trigger = sel ? document.querySelector<HTMLElement>(sel) : null;
  }
  return instance.trigger ?? null;
}

export function isDisabled(el: HTMLElement): boolean {
  return (
    el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true"
  );
}

export function findNextEnabled(
  items: HTMLElement[],
  startIndex: number,
  direction: 1 | -1,
): HTMLElement | null {
  const len = items.length;
  for (let i = 1; i <= len; i++) {
    const index = (startIndex + i * direction + len) % len;
    if (!isDisabled(items[index])) {
      return items[index];
    }
  }
  return null;
}

// Mirrors the authored .active class onto aria-current="page" for nav items,
// and keeps it in sync as the class moves between items.
export function announceCurrent(
  root: HTMLElement,
  selector: string,
): MutationObserver {
  const sync = () => {
    for (const item of root.querySelectorAll<HTMLElement>(selector)) {
      if (item.classList.contains("active")) {
        item.setAttribute("aria-current", "page");
      } else if (item.getAttribute("aria-current") === "page") {
        item.removeAttribute("aria-current");
      }
    }
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  return observer;
}
