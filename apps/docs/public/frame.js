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

// data-open panels open via show() so the enter animation plays.
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

// A modal dialog contains Tab by making the rest of its document inert, but
// the docs page outside this frame is a different document, so Tab would walk
// out of the preview. Wrap it within the open dialog like on a full page.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const dialog = document.querySelector("dialog[open]");
  if (!dialog) return;
  const tabbables = [...dialog.querySelectorAll(FOCUSABLE)];
  if (!tabbables.length) return;
  const first = tabbables[0];
  const last = tabbables[tabbables.length - 1];
  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && (document.activeElement === first || document.activeElement === document.body)) {
    e.preventDefault();
    last.focus();
  }
});
