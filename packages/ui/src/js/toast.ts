// Starting Point UI Toast Module

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
const GAP = 14;
const TYPE_CLASSES = ["toast-success", "toast-error", "toast-warning", "toast-info", "toast-loading"];

interface ToastEntry {
  id: string;
  element: HTMLElement;
  height: number;
  timer: ReturnType<typeof setTimeout> | null;
  position: string;
}

let toastCounter = 0;

const containers = new Map<
  string,
  { element: HTMLElement; toasts: ToastEntry[] }
>();
const byId = new Map<string, ToastEntry>();

function getContainer(position: string) {
  let entry = containers.get(position);
  if (entry) return entry;

  const container = document.createElement("ol");
  container.classList.add("toast", `toast-${position}`);
  container.setAttribute("data-sp-toast-container", "");
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "false");
  document.body.appendChild(container);

  entry = { element: container, toasts: [] };
  containers.set(position, entry);

  return entry;
}

// Recalculate --offset for all toasts in a container
function updateOffsets(position: string) {
  const entry = containers.get(position);
  if (!entry) return;

  const lift = position.startsWith("top") ? 1 : -1;
  let offset = 0;

  // Toasts are ordered newest-first (index 0 = newest = closest to edge)
  for (const t of entry.toasts) {
    t.element.style.setProperty("--offset", `${lift * offset}px`);
    offset += t.height + GAP;
  }
}

// Render title/description/icon into a toast element. Used by both create and update.
function renderContent(el: HTMLElement, title: string, type: ToastType, description?: string) {
  el.classList.remove(...TYPE_CLASSES);
  if (type !== "default") el.classList.add(`toast-${type}`);

  let icon = el.querySelector<HTMLElement>(".toast-icon");
  if (type !== "default") {
    if (!icon) {
      icon = document.createElement("div");
      icon.className = "toast-icon";
      const closeBtn = el.querySelector(".toast-close");
      if (closeBtn) closeBtn.after(icon);
      else el.prepend(icon);
    }
  } else if (icon) {
    icon.remove();
  }

  const content = el.querySelector<HTMLElement>(".toast-content")!;
  const titleEl = content.querySelector<HTMLElement>(".toast-title")!;
  titleEl.textContent = title;

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
  el.classList.add("toast-panel");
  el.setAttribute("role", "status");
  el.setAttribute("data-toast-id", id);

  if (options.dismissible !== false) {
    const close = document.createElement("button");
    close.className = "toast-close";
    close.setAttribute("aria-label", "Close");
    close.setAttribute("data-sp-toast-dismiss", "");
    el.appendChild(close);
  }

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

  // Add to DOM to measure height
  container.element.appendChild(element);
  const height = element.getBoundingClientRect().height;

  // Add to front of list (newest first = closest to edge)
  const entry: ToastEntry = { id, element, height, timer: null, position };
  container.toasts.unshift(entry);
  byId.set(id, entry);

  updateOffsets(position);

  // Trigger mount animation on next frame
  requestAnimationFrame(() => {
    element.setAttribute("data-mounted", "true");
  });

  if (duration > 0) {
    entry.timer = setTimeout(() => dismiss(id), duration);
  }

  // Pause timer on hover, restart on leave
  element.addEventListener("mouseenter", () => {
    if (entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
  });

  element.addEventListener("mouseleave", () => {
    if (duration > 0) {
      entry.timer = setTimeout(() => dismiss(id), duration);
    }
  });

  return {
    id,
    update: (opts: ToastUpdateOptions) => update(id, opts),
    dismiss: () => dismiss(id),
  };
}

export async function dismiss(id: string) {
  const entry = byId.get(id);
  if (!entry) return;

  const container = containers.get(entry.position);
  if (!container) return;

  if (entry.timer) clearTimeout(entry.timer);

  entry.element.setAttribute("data-dismissed", "true");

  const idx = container.toasts.indexOf(entry);
  if (idx !== -1) container.toasts.splice(idx, 1);
  byId.delete(id);

  if (container.toasts.length > 0) {
    updateOffsets(entry.position);
  }

  const exitMs = parseFloat(getComputedStyle(entry.element).getPropertyValue("--toast-exit-duration")) || 300;
  await new Promise((r) => setTimeout(r, exitMs));

  entry.element.remove();

  if (container.toasts.length === 0) {
    container.element.remove();
    containers.delete(entry.position);
  }
}

export function dismissAll() {
  for (const [, container] of containers) {
    for (const t of container.toasts) {
      if (t.timer) clearTimeout(t.timer);
      t.element.remove();
      byId.delete(t.id);
    }
    container.element.remove();
  }
  containers.clear();
}

export function update(id: string, options: ToastUpdateOptions) {
  const entry = byId.get(id);
  if (!entry) return;

  const type = options.type ?? "default";
  renderContent(entry.element, options.title, type, options.description);

  entry.height = entry.element.getBoundingClientRect().height;
  updateOffsets(entry.position);

  const duration = options.duration ?? DEFAULT_DURATION;
  if (entry.timer) clearTimeout(entry.timer);
  if (duration > 0) {
    entry.timer = setTimeout(() => dismiss(id), duration);
  }
}

// Main toast function
export function toast(title: string, options: ToastOptions = {}): ToastInstance {
  const type = options.type ?? "default";
  if (type === "loading") {
    options = { ...options, duration: options.duration ?? 0, dismissible: options.dismissible ?? false };
  }
  return show(title, type, options);
}

toast.update = update;
toast.dismiss = dismiss;
toast.dismissAll = dismissAll;

// Global click handler for dismiss buttons
function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const dismissBtn = target.closest<HTMLElement>("[data-sp-toast-dismiss]");
  if (!dismissBtn) return;
  const toastEl = dismissBtn.closest<HTMLElement>("[data-toast-id]");
  const id = toastEl?.getAttribute("data-toast-id");
  if (id) dismiss(id);
}

// Process declarative toast triggers from HTML
function processToastElement(el: HTMLElement) {
  const value = el.getAttribute("data-sp-toast");
  if (!value) return;

  try {
    const config = JSON.parse(value);
    const title = config.title ?? "";
    delete config.title;
    toast(title, config);
  } catch {
    toast(value);
  }

  el.remove();
}

function scanForToasts(root: Node) {
  if (!(root instanceof HTMLElement)) return;
  if (root.hasAttribute("data-sp-toast")) processToastElement(root);
  for (const el of root.querySelectorAll<HTMLElement>("[data-sp-toast]")) {
    processToastElement(el);
  }
}

// Initialize global listeners
let initialized = false;

function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  const start = () => {
    document.addEventListener("click", handleClick);
    scanForToasts(document.body);
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) scanForToasts(node);
      }
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

init();
