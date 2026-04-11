// Starting Point UI Slider Module

function updateSlider(el: HTMLInputElement) {
  const min = Number(el.min);
  const max = Number(el.max);
  const value = Number(el.value);
  const pct = ((value - min) / (max - min)) * 100;
  el.style.setProperty("--val", `${pct}%`);

  if (el.id) {
    const targets = document.querySelectorAll<HTMLElement>(
      `[data-sp-slider-value="${el.id}"]`,
    );
    targets.forEach((target) => {
      target.textContent = el.value;
    });
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLElement;
  if (
    target instanceof HTMLInputElement &&
    target.type === "range" &&
    target.classList.contains("slider")
  ) {
    updateSlider(target);
  }
}

let initialized = false;

(function init() {
  if (typeof document === "undefined" || initialized) return;
  initialized = true;

  document.addEventListener("input", handleInput);
})();
