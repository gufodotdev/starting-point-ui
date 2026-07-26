// Imperative notifications stacked in per-position top-layer containers.

import { define } from "./define";
import type { SpInstance } from "./define";
import { waitForAnimations } from "./utils";

export interface ToastOptions {
  type?: ToastType;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  dismissible?: boolean;
}

type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export interface ToastUpdateOptions {
  title: string;
  type?: ToastType;
  description?: string;
  duration?: number;
}

export interface ToastInstance {
  id: string;
  update: (opts: ToastUpdateOptions) => void;
  dismiss: () => Promise<void>;
}

const DEFAULT_DURATION = 4000;
// Gap and peek distance; matches the 14px values in toast.css.
const GAP = 14;
// Collapsed stacks show the front toast plus this many peeking behind it.
const VISIBLE = 3;
const TYPE_CLASSES = ["toast-success", "toast-error", "toast-warning", "toast-info", "toast-loading"];

interface ToastEntry {
  id: string;
  element: HTMLElement;
  height: number;
  timer: ReturnType<typeof setTimeout> | null;
  duration: number;
  position: string;
  type: ToastType;
}

let toastCounter = 0;

const containers = new Map<
  string,
  { element: HTMLElement; toasts: ToastEntry[] }
>();
const byId = new Map<string, ToastEntry>();

// Toasts are not component instances, so they dispatch their lifecycle events
// directly. Not cancelable: creation and dismissal are imperative calls.
function emit(el: HTMLElement, type: string) {
  el.dispatchEvent(new CustomEvent(`sp-${type}`, { bubbles: true }));
}

function getContainer(position: string) {
  let entry = containers.get(position);
  if (entry) return entry;

  const container = document.createElement("ol");
  container.classList.add("toaster", `toaster-${position}`);
  container.setAttribute("data-sp-toast-container", "");
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "false");
  container.setAttribute("popover", "manual");
  document.body.appendChild(container);
  container.showPopover();

  // Interacting with the stack expands it (CSS :hover) and pauses every timer.
  const pauseAll = () => {
    for (const t of containers.get(position)?.toasts ?? []) {
      if (t.timer) {
        clearTimeout(t.timer);
        t.timer = null;
      }
    }
  };
  const resumeAll = () => {
    for (const t of containers.get(position)?.toasts ?? []) {
      if (t.duration > 0 && !t.timer) {
        t.timer = setTimeout(() => dismiss(t.id), t.duration);
      }
    }
  };
  container.addEventListener("pointerenter", pauseAll);
  container.addEventListener("pointerleave", resumeAll);
  container.addEventListener("focusin", pauseAll);
  container.addEventListener("focusout", resumeAll);

  entry = { element: container, toasts: [] };
  containers.set(position, entry);

  return entry;
}

// Recalculate the stacking variables for all toasts in a container. CSS
// renders the collapsed stack from --index and switches to the expanded
// --offset while the stack is hovered.
function updateOffsets(position: string) {
  const entry = containers.get(position);
  if (!entry) return;

  const lift = position.startsWith("top") ? 1 : -1;
  let offset = 0;

  // Toasts are ordered newest-first (index 0 = newest = closest to edge)
  entry.toasts.forEach((t, i) => {
    t.element.style.setProperty("--offset", `${lift * offset}px`);
    t.element.style.setProperty("--index", `${i}`);
    t.element.style.zIndex = `${entry.toasts.length - i}`;
    t.element.toggleAttribute("data-sp-stacked", i > 0);
    t.element.toggleAttribute("data-sp-stack-overflow", i >= VISIBLE);
    offset += t.height + GAP;
  });

  const front = entry.toasts[0];
  if (front) {
    entry.element.style.setProperty("--front-toast-height", `${front.height}px`);
  }
}

// Render title/description/icon into a toast element. Used by both create and update.
function renderContent(el: HTMLElement, title: string, type: ToastType, description?: string) {
  el.classList.remove(...TYPE_CLASSES);
  if (type !== "default") el.classList.add(`toast-${type}`);

  const content = el.querySelector<HTMLElement>(".toast-content")!;
  const titleEl = content.querySelector<HTMLElement>(".toast-title")!;

  let icon = titleEl.querySelector<HTMLElement>(".toast-icon");
  if (type !== "default") {
    if (!icon) {
      icon = document.createElement("div");
      icon.className = "toast-icon";
      titleEl.prepend(icon);
    }
  } else if (icon) {
    icon.remove();
  }

  // Update only the title text node, preserving the icon child.
  let textNode = [...titleEl.childNodes].find((n) => n.nodeType === Node.TEXT_NODE);
  if (!textNode) {
    textNode = document.createTextNode("");
    titleEl.appendChild(textNode);
  }
  textNode.textContent = title;

  let descEl = content.querySelector<HTMLElement>(".toast-description");
  if (description) {
    if (!descEl) {
      descEl = document.createElement("div");
      descEl.className = "toast-description";
      content.appendChild(descEl);
    }
    descEl.textContent = description;
  } else if (descEl) {
    descEl.remove();
  }
}

function createToastElement(
  id: string,
  title: string,
  type: ToastType,
  options: ToastOptions,
): HTMLElement {
  const el = document.createElement("li");
  el.classList.add("toast");
  el.setAttribute("role", "status");
  el.setAttribute("data-sp-toast-id", id);

  if (options.dismissible !== false) addCloseButton(el);

  const content = document.createElement("div");
  content.className = "toast-content";
  const titleEl = document.createElement("div");
  titleEl.className = "toast-title";
  content.appendChild(titleEl);
  el.appendChild(content);

  renderContent(el, title, type, options.description);

  if (options.action) {
    const wrap = document.createElement("div");
    wrap.className = "toast-action";
    const btn = document.createElement("button");
    btn.setAttribute("data-sp-toast-action", "");
    btn.textContent = options.action.label;
    btn.addEventListener("click", () => {
      options.action!.onClick();
      dismiss(id);
    });
    wrap.appendChild(btn);
    el.appendChild(wrap);
  }

  return el;
}

function show(title: string, type: ToastType, options: ToastOptions): ToastInstance {
  const id = `sp-toast-${++toastCounter}`;
  const position = options.position ?? "bottom-right";
  const duration = options.duration ?? DEFAULT_DURATION;

  const container = getContainer(position);
  const element = createToastElement(id, title, type, options);

  // Append in the base (closed) state so we can measure without flashing.
  container.element.appendChild(element);
  const height = element.getBoundingClientRect().height;

  // Add to front of list (newest first = closest to edge)
  const entry: ToastEntry = { id, element, height, timer: null, duration, position, type };
  container.toasts.unshift(entry);
  byId.set(id, entry);

  updateOffsets(position);

  // Enter on the next frame so the transition runs from the base state.
  requestAnimationFrame(() => {
    element.classList.add("show");
    emit(element, "show");
    requestAnimationFrame(() => {
      waitForAnimations([element]).then(() => {
        if (!element.classList.contains("show")) return; // dismissed mid-enter
        element.classList.replace("show", "shown");
        emit(element, "shown");
      });
    });
  });

  if (duration > 0) {
    entry.timer = setTimeout(() => dismiss(id), duration);
  }

  return {
    id,
    update: (opts: ToastUpdateOptions) => update(id, opts),
    dismiss: () => dismiss(id),
  };
}

export async function dismiss(id?: string) {
  if (id === undefined) {
    await Promise.all([...byId.keys()].map((each) => dismiss(each)));
    return;
  }

  const entry = byId.get(id);
  if (!entry) return;

  const container = containers.get(entry.position);
  if (!container) return;

  if (entry.timer) clearTimeout(entry.timer);

  const idx = container.toasts.indexOf(entry);
  if (idx !== -1) container.toasts.splice(idx, 1);
  byId.delete(id);

  if (container.toasts.length > 0) {
    updateOffsets(entry.position);
  }

  entry.element.classList.remove("show", "shown");
  entry.element.classList.add("hide");
  emit(entry.element, "hide");
  await waitForAnimations([entry.element]);

  emit(entry.element, "hidden");
  entry.element.remove();

  if (container.toasts.length === 0) {
    if (container.element.matches(":popover-open")) {
      container.element.hidePopover();
    }
    container.element.remove();
    containers.delete(entry.position);
  }
}

function addCloseButton(el: HTMLElement) {
  const close = document.createElement("button");
  close.className = "toast-close";
  close.setAttribute("aria-label", "Close");
  close.setAttribute("data-sp-toast-dismiss", "");
  el.appendChild(close);
}

export function update(id: string, options: ToastUpdateOptions) {
  const entry = byId.get(id);
  if (!entry) return;

  const type = options.type ?? "default";
  renderContent(entry.element, options.title, type, options.description);

  // A loading toast is created without a close button; leaving the loading
  // state makes it dismissible like any other toast.
  if (entry.type === "loading" && type !== "loading" && !entry.element.querySelector(".toast-close")) {
    addCloseButton(entry.element);
  }
  entry.type = type;

  entry.height = entry.element.getBoundingClientRect().height;
  updateOffsets(entry.position);

  const duration = options.duration ?? DEFAULT_DURATION;
  entry.duration = duration;
  if (entry.timer) clearTimeout(entry.timer);
  if (duration > 0) {
    entry.timer = setTimeout(() => dismiss(id), duration);
  }
}

export function toast(title: string, options: ToastOptions = {}): ToastInstance {
  const type = options.type ?? "default";
  if (type === "loading") {
    options = { ...options, duration: options.duration ?? 0, dismissible: options.dismissible ?? false };
  }
  return show(title, type, options);
}

const sugar = (type: ToastType) => (title: string, options: ToastOptions = {}) =>
  toast(title, { ...options, type });

toast.update = update;
toast.dismiss = dismiss;
toast.promise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
): ToastInstance => {
  const instance = toast(messages.loading, { type: "loading" });
  promise.then(
    (data) =>
      instance.update({
        title: typeof messages.success === "function" ? messages.success(data) : messages.success,
        type: "success",
      }),
    (error) =>
      instance.update({
        title: typeof messages.error === "function" ? messages.error(error) : messages.error,
        type: "error",
      }),
  );
  return instance;
};
toast.success = sugar("success");
toast.error = sugar("error");
toast.warning = sugar("warning");
toast.info = sugar("info");
toast.loading = sugar("loading");

// Cached [data-sp-toast] markup re-appears on Back/Forward restores; skip the
// triggers present at load, but process anything inserted afterwards.
let skipFlash =
  typeof performance !== "undefined" &&
  (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
    ?.type === "back_forward";

if (skipFlash && typeof document !== "undefined") {
  // Clears on a task after the observer's initial scan.
  const clear = () => setTimeout(() => (skipFlash = false), 0);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clear, { once: true });
  } else {
    clear();
  }
}

// Flash trigger: an element carrying a toast as a plain string or JSON config,
// fired and removed on sight. Lets server-rendered redirects queue toasts.
export const ToastTrigger = define({
  name: "toast-trigger",
  selector: "[data-sp-toast]",

  init(this: SpInstance) {
    if (skipFlash) return;
    const value = this.el.getAttribute("data-sp-toast") ?? "";
    try {
      const { title = "", ...options } = JSON.parse(value);
      toast(title, options);
    } catch {
      toast(value);
    }
    this.el.remove();
  },
});

if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-sp-toast-dismiss]");
    const id = btn?.closest<HTMLElement>("[data-sp-toast-id]")?.getAttribute("data-sp-toast-id");
    if (id) dismiss(id);
  });
}
