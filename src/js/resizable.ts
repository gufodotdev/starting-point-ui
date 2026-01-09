// Starting Point UI Resizable Module

interface ResizableState {
  startX: number;
  startY: number;
  startSizes: number[];
  panels: HTMLElement[];
  handleIndex: number;
  direction: "horizontal" | "vertical";
  container: HTMLElement;
}

let activeState: ResizableState | null = null;

function getDirection(container: HTMLElement): "horizontal" | "vertical" {
  return container.dataset.direction === "vertical" ? "vertical" : "horizontal";
}

function getPanels(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(":scope > .resizable-panel"),
  ];
}

function getHandles(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(":scope > .resizable-handle"),
  ];
}

function getPanelSizes(
  panels: HTMLElement[],
  direction: "horizontal" | "vertical"
): number[] {
  return panels.map((panel) => {
    const rect = panel.getBoundingClientRect();
    return direction === "horizontal" ? rect.width : rect.height;
  });
}

function getContainerSize(
  container: HTMLElement,
  direction: "horizontal" | "vertical"
): number {
  const rect = container.getBoundingClientRect();
  return direction === "horizontal" ? rect.width : rect.height;
}

function getMinSizePx(
  panel: HTMLElement,
  direction: "horizontal" | "vertical"
): number {
  const computed = getComputedStyle(panel);
  const value =
    direction === "horizontal" ? computed.minWidth : computed.minHeight;
  return value === "none" || value === "auto" ? 0 : parseFloat(value);
}

function getMaxSizePx(
  panel: HTMLElement,
  direction: "horizontal" | "vertical"
): number {
  const computed = getComputedStyle(panel);
  const value =
    direction === "horizontal" ? computed.maxWidth : computed.maxHeight;
  return value === "none" || value === "auto" ? Infinity : parseFloat(value);
}

function applyPanelSizes(panels: HTMLElement[], sizes: number[]) {
  const totalSize = sizes.reduce((a, b) => a + b, 0);
  for (let i = 0; i < panels.length; i++) {
    const percentage = (sizes[i] / totalSize) * 100;
    panels[i].style.flexBasis = `${percentage}%`;
    panels[i].style.flexGrow = "0";
    panels[i].style.flexShrink = "0";
  }
}

export function setSizes(container: HTMLElement, sizes: number[]) {
  const panels = getPanels(container);
  const direction = getDirection(container);
  const containerSize = getContainerSize(container, direction);

  if (sizes.length !== panels.length) {
    console.warn("Resizable: sizes array length must match panel count");
    return;
  }

  const pixelSizes = sizes.map((pct) => (pct / 100) * containerSize);
  applyPanelSizes(panels, pixelSizes);
}

export function getSizes(container: HTMLElement): number[] {
  const panels = getPanels(container);
  const direction = getDirection(container);
  const containerSize = getContainerSize(container, direction);
  const sizes = getPanelSizes(panels, direction);

  return sizes.map((size) => (size / containerSize) * 100);
}

function handlePointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement;
  const handle = target.closest<HTMLElement>(".resizable-handle");
  if (!handle) return;

  const container = handle.closest<HTMLElement>(".resizable");
  if (!container) return;

  e.preventDefault();
  handle.setPointerCapture(e.pointerId);
  handle.focus();

  const direction = getDirection(container);
  const panels = getPanels(container);
  const handles = getHandles(container);
  const handleIndex = handles.indexOf(handle);

  if (handleIndex < 0 || handleIndex >= panels.length - 1) return;

  const startSizes = getPanelSizes(panels, direction);

  activeState = {
    startX: e.clientX,
    startY: e.clientY,
    startSizes,
    panels,
    handleIndex,
    direction,
    container,
  };

  handle.setAttribute("data-dragging", "true");
  document.body.style.cursor =
    direction === "horizontal" ? "col-resize" : "row-resize";
  document.body.style.userSelect = "none";
}

function handlePointerMove(e: PointerEvent) {
  if (!activeState) return;

  const {
    startX,
    startY,
    startSizes,
    panels,
    handleIndex,
    direction,
    container,
  } = activeState;

  const delta =
    direction === "horizontal" ? e.clientX - startX : e.clientY - startY;

  const containerSize = getContainerSize(container, direction);
  const beforeIndex = handleIndex;
  const afterIndex = handleIndex + 1;
  const combinedSize = startSizes[beforeIndex] + startSizes[afterIndex];

  let beforeSize = startSizes[beforeIndex] + delta;
  let afterSize = startSizes[afterIndex] - delta;

  const beforeMinPx = getMinSizePx(panels[beforeIndex], direction);
  const beforeMaxPx = getMaxSizePx(panels[beforeIndex], direction);
  const afterMinPx = getMinSizePx(panels[afterIndex], direction);
  const afterMaxPx = getMaxSizePx(panels[afterIndex], direction);

  // Clamp sizes to min/max constraints while preserving combined size
  beforeSize = Math.max(beforeMinPx, Math.min(beforeMaxPx, beforeSize));
  afterSize = combinedSize - beforeSize;
  if (afterSize < afterMinPx) {
    afterSize = afterMinPx;
    beforeSize = combinedSize - afterSize;
  }
  if (afterSize > afterMaxPx) {
    afterSize = afterMaxPx;
    beforeSize = combinedSize - afterSize;
  }

  const newSizes = [...startSizes];
  newSizes[beforeIndex] = beforeSize;
  newSizes[afterIndex] = afterSize;

  applyPanelSizes(panels, newSizes);
  container.dispatchEvent(
    new CustomEvent("sp:resize", {
      detail: {
        sizes: newSizes.map((size) => (size / containerSize) * 100),
      },
    })
  );
}

function handlePointerUp(e: PointerEvent) {
  if (!activeState) return;

  const target = e.target as HTMLElement;
  const handle = target.closest<HTMLElement>(".resizable-handle");

  if (handle) {
    handle.releasePointerCapture(e.pointerId);
    handle.removeAttribute("data-dragging");
  }

  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  activeState = null;
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("resizable-handle")) return;

  const container = target.closest<HTMLElement>(".resizable");
  if (!container) return;

  const direction = getDirection(container);
  const panels = getPanels(container);
  const handles = getHandles(container);
  const handleIndex = handles.indexOf(target);

  if (handleIndex < 0 || handleIndex >= panels.length - 1) return;

  const step = e.shiftKey ? 10 : 1;
  let delta = 0;

  if (direction === "horizontal") {
    if (e.key === "ArrowLeft") delta = -step;
    else if (e.key === "ArrowRight") delta = step;
  } else {
    if (e.key === "ArrowUp") delta = -step;
    else if (e.key === "ArrowDown") delta = step;
  }

  if (delta === 0) return;

  e.preventDefault();

  const containerSize = getContainerSize(container, direction);
  const currentSizes = getPanelSizes(panels, direction);

  const beforeIndex = handleIndex;
  const afterIndex = handleIndex + 1;
  const deltaPx = (delta / 100) * containerSize;

  const beforeSize = currentSizes[beforeIndex] + deltaPx;
  const afterSize = currentSizes[afterIndex] - deltaPx;

  const beforeMinPx = getMinSizePx(panels[beforeIndex], direction);
  const beforeMaxPx = getMaxSizePx(panels[beforeIndex], direction);
  const afterMinPx = getMinSizePx(panels[afterIndex], direction);
  const afterMaxPx = getMaxSizePx(panels[afterIndex], direction);

  if (beforeSize < beforeMinPx || afterSize < afterMinPx) return;
  if (beforeSize > beforeMaxPx || afterSize > afterMaxPx) return;

  const newSizes = [...currentSizes];
  newSizes[beforeIndex] = beforeSize;
  newSizes[afterIndex] = afterSize;

  applyPanelSizes(panels, newSizes);

  container.dispatchEvent(
    new CustomEvent("sp:resize", {
      detail: {
        sizes: newSizes.map((size) => (size / containerSize) * 100),
      },
    })
  );
}

// Initialize global listeners
let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("keydown", handleKeydown);
})();
