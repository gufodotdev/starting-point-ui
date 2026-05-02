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
