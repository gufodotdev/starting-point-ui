// Starting Point UI Utilities

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
  ].filter((el) => el.offsetParent !== null);
}

export async function waitForAnimations(
  elements: HTMLElement[]
): Promise<void> {
  const animations = elements.flatMap((el) => el.getAnimations());
  if (animations.length === 0) return;
  await Promise.all(animations.map((a) => a.finished));
}
