// Starting Point UI Utilities

import {
  computePosition,
  flip,
  shift,
  offset as offsetMw,
  arrow as arrowMw,
  type Placement,
} from "@floating-ui/dom";

const STATIC_SIDE: Record<string, string> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

export async function positionFloating(
  reference: HTMLElement,
  floating: HTMLElement,
  options: {
    placement: Placement;
    offset?: number;
    arrow?: HTMLElement;
  },
): Promise<void> {
  const middleware = [
    offsetMw(options.offset ?? 4),
    flip({ crossAxis: true, fallbackAxisSideDirection: "start" }),
    shift({ padding: 8 }),
  ];

  if (options.arrow) {
    middleware.push(arrowMw({ element: options.arrow, padding: 4 }));
  }

  const result = await computePosition(reference, floating, {
    placement: options.placement,
    middleware,
  });

  Object.assign(floating.style, {
    left: `${result.x}px`,
    top: `${result.y}px`,
  });

  if (options.arrow && result.middlewareData.arrow) {
    const { x, y } = result.middlewareData.arrow;
    const side = STATIC_SIDE[result.placement.split("-")[0]];

    Object.assign(options.arrow.style, {
      left: x != null ? `${x}px` : "",
      top: y != null ? `${y}px` : "",
      [side]: "-4px",
    });
  }
}

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

export interface PoppableConfig {
  rootSelector: string;
  contentSelector: string;
  triggerSelector: string;
  ariaExpanded?: boolean; // default true; set false to skip aria-expanded toggling
  position: (root: HTMLElement, trigger: HTMLElement, content: HTMLElement) => Promise<void>;
  onAfterOpen?: (root: HTMLElement, content: HTMLElement) => void;
  onAfterClose?: (root: HTMLElement, content: HTMLElement) => void;
}

const poppableStates = new WeakMap<HTMLElement, "open" | "close">();

export function getOpenPoppable(cfg: PoppableConfig): HTMLElement | null {
  const openContent = document.querySelector(`${cfg.contentSelector}.open`);
  return openContent?.closest<HTMLElement>(cfg.rootSelector) ?? null;
}

function getContent(root: HTMLElement, cfg: PoppableConfig): HTMLElement | null {
  return root.querySelector<HTMLElement>(cfg.contentSelector);
}

function getTrigger(root: HTMLElement, cfg: PoppableConfig): HTMLElement | null {
  return root.querySelector<HTMLElement>(cfg.triggerSelector);
}

export async function closePoppable(root: HTMLElement, cfg: PoppableConfig): Promise<void> {
  const content = getContent(root, cfg);
  if (!content || !content.classList.contains("open")) return;
  if (poppableStates.get(content) === "close") return;

  poppableStates.set(content, "close");

  if (cfg.ariaExpanded !== false) {
    getTrigger(root, cfg)?.setAttribute("aria-expanded", "false");
  }

  content.setAttribute("data-state", "closed");

  await waitForAnimations([content]);

  if (poppableStates.get(content) !== "close") return;

  content.classList.remove("open");
  content.removeAttribute("data-state");

  cfg.onAfterClose?.(root, content);
}

export async function openPoppable(root: HTMLElement, cfg: PoppableConfig): Promise<void> {
  const content = getContent(root, cfg);
  if (!content) return;

  // Already fully open (not just .open class still present during a close animation)
  if (content.classList.contains("open") && poppableStates.get(content) === "open") return;

  const openRoot = getOpenPoppable(cfg);
  if (openRoot && openRoot !== root) {
    closePoppable(openRoot, cfg);
  }

  poppableStates.set(content, "open");
  content.style.visibility = "hidden";
  content.classList.add("open");

  const trigger = getTrigger(root, cfg);
  if (trigger) await cfg.position(root, trigger, content);

  if (poppableStates.get(content) !== "open") return;

  content.style.visibility = "";
  content.setAttribute("data-state", "open");

  if (cfg.ariaExpanded !== false) {
    trigger?.setAttribute("aria-expanded", "true");
  }

  cfg.onAfterOpen?.(root, content);
}

export function togglePoppable(root: HTMLElement, cfg: PoppableConfig): void {
  const content = getContent(root, cfg);
  if (content?.classList.contains("open") && poppableStates.get(content) === "open") {
    closePoppable(root, cfg);
  } else {
    openPoppable(root, cfg);
  }
}

export function closeIfOutside(target: HTMLElement | null, cfg: PoppableConfig): void {
  const openRoot = getOpenPoppable(cfg);
  if (openRoot && (!target || !openRoot.contains(target))) {
    closePoppable(openRoot, cfg);
  }
}
