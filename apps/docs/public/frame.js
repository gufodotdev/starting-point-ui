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
      if (!nested) instance.show();
    }
  };
  show();
}
