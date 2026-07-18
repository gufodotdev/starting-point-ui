if (window.frameElement) {
  const frame = window.frameElement;

  const resize = () => {
    const height = document.body.scrollHeight;
    if (height > 0) frame.style.height = `${height}px`;
  };

  new ResizeObserver(resize).observe(document.body);
  resize();
} else {
  document
    .querySelector("[data-no-scrollbar-gutter]")
    ?.style.setProperty("min-height", "100dvh");
}

// Floating components (popover, dropdown, ...) can't be authored open since
// JS positions them, so open= is passed through as data-open and shown here
// once the runtime has loaded.
const openHost = document.querySelector("[data-open]");
if (openHost) {
  const selector = openHost.dataset.open;
  const name = selector.slice(1);
  const show = () => {
    if (!window.sp || !window.sp[name]) {
      requestAnimationFrame(show);
      return;
    }
    // Only top-level panels: a submenu's trigger lives inside another match,
    // and should stay closed until the user reaches it.
    const panels = [...document.querySelectorAll(selector)];
    for (const el of panels) {
      const instance = window.sp[name](el);
      if (!instance) continue;
      const nested = panels.some((other) => other !== el && other.contains(instance.trigger));
      if (!nested) {
        instance.show();
        if (!window.__spBridgeTarget && instance.trigger) {
          window.__spBridgeTarget = instance.trigger;
        }
      }
    }
  };
  show();
}

// The docs focus this window when the pointer enters the frame, landing on
// body. Hand the first key press to the component the user is looking at: the
// trigger of a panel opened on load, or the first tabbable element otherwise.
// Focus rings only ever show for actual keyboard use.
const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

document.addEventListener("keydown", (e) => {
  if (document.activeElement !== document.body) return;
  let target = window.__spBridgeTarget ?? document.body.querySelector(FOCUSABLE);
  // A panel trigger can be a wrapper (the combobox anchor); focus what's inside.
  if (target && !target.matches(FOCUSABLE)) target = target.querySelector(FOCUSABLE);
  if (!target) return;
  const keys = window.__spBridgeTarget
    ? ["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"]
    : ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  target.focus({ preventScroll: true });
  // Synthetic events never trigger native actions, so this only reaches the
  // component's own handlers.
  target.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, bubbles: true }));
});

