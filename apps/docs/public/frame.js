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
