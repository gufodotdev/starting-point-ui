// Starting Point UI Floating Module
//
// Anchored-content primitive: trigger → content via data-sp-target="#id".
// On open, content is portaled to <body> and positioned by Floating UI.

import {
  autoUpdate,
  computePosition,
  flip,
  shift,
  offset as offsetMw,
  arrow as arrowMw,
  type Placement,
} from "@floating-ui/dom";
import { getFocusableElements, waitForAnimations } from "./utils";

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

export interface AnchorOptions {
  contentSelector: string;
  triggerSelector: string;
  ariaExpanded?: boolean;
  position: (trigger: HTMLElement, content: HTMLElement) => Promise<void>;
  onAfterOpen?: (trigger: HTMLElement, content: HTMLElement) => void;
  onAfterClose?: (trigger: HTMLElement, content: HTMLElement) => void;
}

interface AnchorRecord {
  trigger: HTMLElement;
  parent: Node;
  nextSibling: Node | null;
  cleanup: () => void;
  /** Focus moved into the content; Tab is trapped. */
  focused: boolean;
}

const anchorRecords = new WeakMap<HTMLElement, AnchorRecord>();
const activeAnchors = new Map<HTMLElement, AnchorRecord>();
const anchorStates = new WeakMap<HTMLElement, "open" | "close">();

// The panel is excluded from the Tab cycle so Tab from it goes to the first child.
let trapInstalled = false;
function installFocusTrap() {
  if (trapInstalled || typeof document === "undefined") return;
  trapInstalled = true;
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    for (const [content, record] of activeAnchors) {
      if (!record.focused) continue;
      if (!content.classList.contains("open")) continue;

      const focusable = getFocusableElements(content);
      if (focusable.length === 0) {
        e.preventDefault();
        content.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (active === content) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
  });
}

export function getTargetContent(trigger: HTMLElement): HTMLElement | null {
  const targetSel = trigger.getAttribute("data-sp-target");
  if (!targetSel) return null;
  return document.querySelector<HTMLElement>(targetSel);
}

export function getAnchorTrigger(content: HTMLElement): HTMLElement | null {
  return activeAnchors.get(content)?.trigger ?? null;
}

/** Committed = focus inside the content (vs passively opened from hover). */
export function isAnchorCommitted(content: HTMLElement): boolean {
  return activeAnchors.get(content)?.focused ?? false;
}

export function getOpenAnchor(opts: AnchorOptions): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(`${opts.contentSelector}.open`) ?? null
  );
}

export async function openAnchor(
  trigger: HTMLElement,
  content: HTMLElement,
  opts: AnchorOptions,
  options: { viaClick?: boolean } = {},
): Promise<void> {
  // Click on an already-passively-open panel: commit it (move focus in).
  if (
    content.classList.contains("open") &&
    anchorStates.get(content) === "open"
  ) {
    const record = anchorRecords.get(content);
    if (options.viaClick && record && !record.focused) {
      record.focused = true;
      if (!content.hasAttribute("tabindex")) content.tabIndex = -1;
      content.focus({ preventScroll: true });
    }
    return;
  }

  const otherOpen = getOpenAnchor(opts);
  if (otherOpen && otherOpen !== content) {
    closeAnchor(otherOpen, opts);
  }

  installFocusTrap();
  const willFocus = options.viaClick ?? true;

  anchorStates.set(content, "open");
  content.style.visibility = "hidden";
  content.classList.add("open");

  if (!anchorRecords.has(content)) {
    const record: AnchorRecord = {
      trigger,
      parent: content.parentNode!,
      nextSibling: content.nextSibling,
      cleanup: () => {},
      focused: willFocus,
    };
    document.body.appendChild(content);
    // Position before autoUpdate; otherwise focus lands at body's top-left
    // and the browser auto-scrolls to it.
    await opts.position(trigger, content);
    record.cleanup = autoUpdate(trigger, content, () => {
      opts.position(trigger, content);
    });
    anchorRecords.set(content, record);
    activeAnchors.set(content, record);
  } else {
    await opts.position(trigger, content);
  }

  if (anchorStates.get(content) !== "open") return;

  content.style.visibility = "";
  content.setAttribute("data-state", "open");

  if (opts.ariaExpanded !== false) {
    trigger.setAttribute("aria-expanded", "true");
  }

  if (willFocus) {
    if (!content.hasAttribute("tabindex")) content.tabIndex = -1;
    content.focus({ preventScroll: true });
  }

  opts.onAfterOpen?.(trigger, content);
}

export async function closeAnchor(
  content: HTMLElement,
  opts: AnchorOptions,
): Promise<void> {
  if (!content.classList.contains("open")) return;
  if (anchorStates.get(content) === "close") return;

  anchorStates.set(content, "close");

  const record = anchorRecords.get(content);
  const trigger = record?.trigger;

  if (opts.ariaExpanded !== false && trigger) {
    trigger.setAttribute("aria-expanded", "false");
  }

  content.setAttribute("data-state", "closed");
  await waitForAnimations([content]);

  if (anchorStates.get(content) !== "close") return;

  content.classList.remove("open");
  content.removeAttribute("data-state");

  if (record) {
    record.cleanup();
    record.parent.insertBefore(content, record.nextSibling);
    anchorRecords.delete(content);
    activeAnchors.delete(content);
  }

  if (trigger) opts.onAfterClose?.(trigger, content);
}

export function toggleAnchor(
  trigger: HTMLElement,
  content: HTMLElement,
  opts: AnchorOptions,
  options: { viaClick?: boolean } = {},
): void {
  const isOpen =
    content.classList.contains("open") &&
    anchorStates.get(content) === "open";

  if (!isOpen) {
    openAnchor(trigger, content, opts, options);
    return;
  }

  // Passive open + click → commit. Committed open + click → close.
  if (options.viaClick && !isAnchorCommitted(content)) {
    openAnchor(trigger, content, opts, options);
    return;
  }

  closeAnchor(content, opts);
}

export function closeAnchorIfOutside(
  target: HTMLElement | null,
  opts: AnchorOptions,
): void {
  const open = getOpenAnchor(opts);
  if (!open) return;
  const trigger = getAnchorTrigger(open);
  const inside =
    target && (open.contains(target) || trigger?.contains(target));
  if (!inside) closeAnchor(open, opts);
}

export function getTriggerMode(trigger: HTMLElement): "click" | "hover" {
  return trigger.getAttribute("data-sp-trigger") === "hover" ? "hover" : "click";
}

/**
 * Install hover-mode listeners. Opens passively, closes 150ms after the
 * pointer leaves both trigger and content. Click is per-component.
 */
export function installHoverTriggers(opts: AnchorOptions): void {
  if (typeof document === "undefined") return;

  const HOVER_CLOSE_DELAY = 150;
  const closeTimers = new WeakMap<HTMLElement, number>();

  function cancelClose(content: HTMLElement) {
    const t = closeTimers.get(content);
    if (t !== undefined) {
      clearTimeout(t);
      closeTimers.delete(content);
    }
  }

  function scheduleClose(content: HTMLElement) {
    cancelClose(content);
    const handle = window.setTimeout(() => {
      closeAnchor(content, opts);
      closeTimers.delete(content);
    }, HOVER_CLOSE_DELAY);
    closeTimers.set(content, handle);
  }

  function openOnHover(trigger: HTMLElement) {
    if (getTriggerMode(trigger) !== "hover") return;
    const content = getTargetContent(trigger);
    if (!content) return;
    cancelClose(content);
    openAnchor(trigger, content, opts, { viaClick: false });
  }

  document.addEventListener("pointerover", (e) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest<HTMLElement>(opts.triggerSelector);
    if (trigger) {
      openOnHover(trigger);
      return;
    }
    const content = target.closest<HTMLElement>(opts.contentSelector);
    if (content) cancelClose(content);
  });

  document.addEventListener("pointerout", (e) => {
    // Touch pointerout fires on tap-end, not hover-leave. Ignore.
    if (e.pointerType === "touch") return;

    const target = e.target as HTMLElement;
    const related = e.relatedTarget as HTMLElement | null;

    const trigger = target.closest<HTMLElement>(opts.triggerSelector);
    if (trigger && getTriggerMode(trigger) === "hover") {
      const content = getTargetContent(trigger);
      if (
        content &&
        related &&
        (content.contains(related) || trigger.contains(related))
      ) {
        return;
      }
      if (content?.classList.contains("open")) scheduleClose(content);
      return;
    }

    // Only hover-mode panels auto-close on pointer leave.
    const content = target.closest<HTMLElement>(opts.contentSelector);
    if (content) {
      const associatedTrigger = getAnchorTrigger(content);
      if (!associatedTrigger || getTriggerMode(associatedTrigger) !== "hover") {
        return;
      }
      if (
        related &&
        (content.contains(related) || associatedTrigger.contains(related))
      ) {
        return;
      }
      if (content.classList.contains("open")) scheduleClose(content);
    }
  });
}
