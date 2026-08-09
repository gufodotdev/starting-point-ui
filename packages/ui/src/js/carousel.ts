// Carousel: a scroll-snap track with previous/next controls; settling on a
// new slide fires sp-change.

import { define } from "./define";
import type { SpInstance } from "./define";

const ITEM = ".carousel-item:not([data-sp-clone])";

const NO_DRAG =
  "input, textarea, select, [contenteditable], [data-sp-no-drag]";

const COMMIT_THRESHOLD = 8;

const GLIDE_DURATION = 25;
const GLIDE_FRICTION = 0.68;
const GLIDE_STEP_MS = 1000 / 60;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const Carousel = define({
  name: "carousel",
  selector: ".carousel",

  props: {
    loop: Boolean,
    autoplay: Number,
  },

  init(this: SpInstance) {
    const content = this.el.querySelector<HTMLElement>(".carousel-content");
    if (!content) return;
    this._content = content;
    this._index = 0;
    this._pendingIndex = 0;
    this._fade = this.el.classList.contains("carousel-fade");
    this._vertical = this.el.classList.contains("carousel-vertical");
    if (this.config.loop && !this._fade) this._cloneEdges();

    this.el.setAttribute("role", "region");
    if (!this.el.hasAttribute("aria-roledescription")) {
      this.el.setAttribute("aria-roledescription", "carousel");
    }
    const items: HTMLElement[] = this._items();
    items.forEach((item) => {
      if (!item.hasAttribute("role")) item.setAttribute("role", "group");
      if (!item.hasAttribute("aria-roledescription")) {
        item.setAttribute("aria-roledescription", "slide");
      }
    });

    const previous: HTMLElement[] = this._controls(".carousel-previous");
    previous.forEach((button) => {
      this.on(button, "click", () => this.prev());
    });
    const next: HTMLElement[] = this._controls(".carousel-next");
    next.forEach((button) => {
      this.on(button, "click", () => this.next());
    });

    // Children of every carousel-pagination container page to their slide by
    // position; _update keeps the current one marked with the active class.
    const pagination: HTMLElement[] = this._controls(".carousel-pagination");
    pagination.forEach((dots) => {
      [...dots.children].forEach((dot, i) => {
        this.on(dot as HTMLElement, "click", () => this.to(i));
      });
    });

    this.on(this.el, "keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      const prevKey = this._vertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = this._vertical ? "ArrowDown" : "ArrowRight";
      if (key !== prevKey && key !== nextKey) return;
      e.preventDefault();
      if (key === prevKey) this.prev();
      else this.next();
    });

    if (this._fade) {
      const items: HTMLElement[] = this._items();
      this._index = Math.max(
        0,
        items.findIndex((item) => item.classList.contains("active")),
      );
      this._show(this._index as number);
      this._autoplaySetup();
      return;
    }

    this.on(content, "scrollend", () => this._sync());
    let frame = 0;
    this.on(content, "scroll", () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        this._sync();
        // Any scroll postpones the next auto-advance, so autoplay never
        // fights an interaction that is already moving the track.
        if (this._autoplayTimer) this._autoplayStart();
      });
    });

    this._autoplaySetup();
    this.on(content, "pointerdown", (e) => this._drag(e as PointerEvent));
    this._sync();
  },

  destroy(this: SpInstance) {
    clearInterval(this._autoplayTimer as number);
    cancelAnimationFrame(this._glideFrame as number);
    this._glideActive = false;
    (this._content as HTMLElement | undefined)
      ?.querySelectorAll("[data-sp-clone]")
      .forEach((el) => el.remove());
  },

  methods: {
    _items(this: SpInstance): HTMLElement[] {
      const content = this._content as HTMLElement | undefined;
      return content ? [...content.querySelectorAll<HTMLElement>(ITEM)] : [];
    },

    // Controls anywhere under the root, except those belonging to a carousel
    // nested inside it.
    _controls(this: SpInstance, selector: string): HTMLElement[] {
      return [...this.el.querySelectorAll<HTMLElement>(selector)].filter(
        (el) => el.closest(".carousel") === this.el,
      );
    },

    _rectStart(this: SpInstance, rect: DOMRect): number {
      return this._vertical ? rect.top : rect.left;
    },

    _scrollPos(this: SpInstance): number {
      const content = this._content as HTMLElement;
      return this._vertical ? content.scrollTop : content.scrollLeft;
    },

    _setScroll(this: SpInstance, position: number): void {
      const content = this._content as HTMLElement;
      if (this._vertical) content.scrollTop = position;
      else content.scrollLeft = position;
    },

    _jump(this: SpInstance, delta: number): void {
      (this._content as HTMLElement).scrollBy({
        left: this._vertical ? 0 : delta,
        top: this._vertical ? delta : 0,
        behavior: "auto",
      });
    },

    // Looping clones enough slides onto each end to fill the viewport, so a
    // wrap glides onto a copy like any other step; _sync then teleports to
    // the identical real slide once the copy settles.
    _cloneEdges(this: SpInstance): void {
      const content = this._content as HTMLElement;
      const items = this._items();
      if (items.length < 2) return;
      const viewport = this._vertical ? content.clientHeight : content.clientWidth;
      const size = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return this._vertical ? rect.height : rect.width;
      };
      const clone = (item: HTMLElement, index: number) => {
        const copy = item.cloneNode(true) as HTMLElement;
        copy.setAttribute("data-sp-clone", String(index));
        copy.setAttribute("aria-hidden", "true");
        copy.setAttribute("inert", "");
        copy.removeAttribute("id");
        copy.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        return copy;
      };
      let filled = 0;
      let head = 0;
      while (filled < viewport && head < items.length) {
        filled += size(items[head]);
        head += 1;
      }
      for (let i = 0; i < head; i += 1) content.append(clone(items[i], i));
      filled = 0;
      let tail = 0;
      while (filled < viewport && tail < items.length) {
        filled += size(items[items.length - 1 - tail]);
        tail += 1;
      }
      for (let i = 0; i < tail; i += 1) {
        const index = items.length - 1 - i;
        content.prepend(clone(items[index], index));
      }
      this._jump(
        this._rectStart(items[0].getBoundingClientRect()) -
          this._rectStart(content.getBoundingClientRect()),
      );
    },

    count(this: SpInstance): number {
      return this._items().length;
    },

    index(this: SpInstance): number {
      return this._index as number;
    },

    to(this: SpInstance, index: number, wrap = false): void {
      const items = this._items();
      if (!items.length) return;
      const count = items.length;
      const loop = this.config.loop as boolean;
      if (this._fade) {
        this._show(
          loop
            ? (index + count) % count
            : Math.max(0, Math.min(count - 1, index)),
        );
        return;
      }
      const content = this._content as HTMLElement;
      if (!content) return;
      let target: HTMLElement | undefined;
      if (loop && (index === count || index === -1)) {
        const twin = index === count ? 0 : count - 1;
        const clones = content.querySelectorAll<HTMLElement>(
          `[data-sp-clone="${twin}"]`,
        );
        target = index === count ? clones[clones.length - 1] : clones[0];
        if (target) this._pendingIndex = twin;
      }
      const wrapped =
        wrap || (!target && loop && (index < 0 || index >= count));
      if (!target) {
        const destination = loop
          ? (index + count) % count
          : Math.max(0, Math.min(count - 1, index));
        this._pendingIndex = destination;
        target = items[destination];
      }
      if (!target) return;
      const delta =
        this._rectStart(target.getBoundingClientRect()) -
        this._rectStart(content.getBoundingClientRect());
      if (wrapped || reducedMotion()) this._jump(delta);
      else this._glide(delta);
    },

    // Steps base on the in-flight destination, not the passing index, so
    // rapid clicks advance one slide each instead of retargeting the same one.
    _stepBase(this: SpInstance): number {
      return (
        this._glideActive ? this._pendingIndex : this._index
      ) as number;
    },

    prev(this: SpInstance): void {
      this.to(this._stepBase() - 1);
    },

    next(this: SpInstance): void {
      this.to(this._stepBase() + 1);
    },

    // Touch drags natively; this adds the same drag for mouse. Snapping is
    // released while dragging so the track follows the pointer, then the
    // release settles on the nearest slide, flicked one further by velocity.
    _drag(this: SpInstance, pe: PointerEvent): void {
      if (pe.pointerType !== "mouse" || pe.button !== 0) return;
      // Fields keep their native drag; data-sp-no-drag opts anything else
      // out of the carousel drag.
      if ((pe.target as HTMLElement).closest(NO_DRAG)) return;
      const content = this._content as HTMLElement;
      cancelAnimationFrame(this._glideFrame as number);
      this._glideActive = false;
      const start = this._vertical ? pe.clientY : pe.clientX;
      const startScroll = this._scrollPos();
      const startIndex = this._index as number;
      let last = start;
      let lastTime = performance.now();
      let velocity = 0;
      let moved = false;

      const block = (ev: Event) => ev.preventDefault();
      content.addEventListener("dragstart", block);

      const move = (ev: PointerEvent) => {
        const position = this._vertical ? ev.clientY : ev.clientX;
        const delta = position - start;
        const now = performance.now();
        velocity = (position - last) / Math.max(1, now - lastTime);
        last = position;
        lastTime = now;
        if (!moved) {
          if (Math.abs(delta) <= COMMIT_THRESHOLD) return;
          // A mouse that started on text is selecting by now; let it.
          const selection = document.getSelection();
          if (selection && !selection.isCollapsed) {
            up();
            return;
          }
          moved = true;
          // Capturing only once it is a real drag keeps plain clicks
          // targeting the slide content.
          content.setPointerCapture(ev.pointerId);
          content.style.scrollSnapType = "none";
          content.style.userSelect = "none";
          selection?.removeAllRanges();
        }
        this._setScroll(startScroll - delta);
      };
      const up = () => {
        content.removeEventListener("pointermove", move);
        content.removeEventListener("dragstart", block);
        content.style.userSelect = "";
        if (!moved) {
          content.style.scrollSnapType = "";
          return;
        }
        const suppress = (ce: Event) => {
          ce.preventDefault();
          ce.stopPropagation();
        };
        content.addEventListener("click", suppress, { capture: true, once: true });
        setTimeout(() => content.removeEventListener("click", suppress, true), 0);
        this._sync();
        // Velocity only advances a flick that stayed on the starting slide;
        // a drag that already crossed to another slide settles there.
        const flick =
          Math.abs(velocity) > 0.4 && this._index === startIndex
            ? velocity < 0
              ? 1
              : -1
            : 0;
        // The release settles on the nearest slide including edge clones, so
        // a drag past the ends rests on the copy and swaps after settling.
        const all = [
          ...content.querySelectorAll<HTMLElement>(".carousel-item"),
        ];
        const box = content.getBoundingClientRect();
        let best = 0;
        let bestDistance = Infinity;
        all.forEach((slide, i) => {
          const distance = Math.abs(
            this._rectStart(slide.getBoundingClientRect()) -
              this._rectStart(box),
          );
          if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
          }
        });
        const target = all[Math.max(0, Math.min(all.length - 1, best + flick))];
        const twin = target.getAttribute("data-sp-clone");
        this._pendingIndex =
          twin === null ? this._items().indexOf(target) : Number(twin);
        const settleDelta =
          this._rectStart(target.getBoundingClientRect()) -
          this._rectStart(box);
        if (reducedMotion()) {
          this._jump(settleDelta);
          content.style.scrollSnapType = "";
          this._sync();
        } else {
          // The release feeds the throw velocity into the glide, so a flick
          // carries its momentum through the settle.
          this._glide(settleDelta, -velocity * GLIDE_STEP_MS);
        }
      };
      content.addEventListener("pointermove", move);
      content.addEventListener("pointerup", up, { once: true });
      content.addEventListener("pointercancel", up, { once: true });
    },

    // Native smooth scrolling is quick and cannot be tuned, so programmatic
    // glides run attraction-and-friction physics on a fixed timestep;
    // retargeting keeps the velocity so rapid clicks stay fluid.
    _glide(this: SpInstance, delta: number, velocity = 0): void {
      const content = this._content as HTMLElement;
      this._glideTarget = this._scrollPos() + delta;
      if (this._glideActive) return;
      this._glideActive = true;
      this._glideVelocity = velocity;
      let location = this._scrollPos();
      let last = performance.now();
      let lag = 0;
      content.style.scrollSnapType = "none";
      const step = (now: number) => {
        // The cap swallows a background tab's pause instead of replaying it.
        lag = Math.min(lag + now - last, GLIDE_STEP_MS * 4);
        last = now;
        while (lag >= GLIDE_STEP_MS) {
          lag -= GLIDE_STEP_MS;
          const displacement = (this._glideTarget as number) - location;
          this._glideVelocity =
            ((this._glideVelocity as number) + displacement / GLIDE_DURATION) *
            GLIDE_FRICTION;
          location += this._glideVelocity as number;
        }
        const displacement = (this._glideTarget as number) - location;
        if (
          Math.abs(displacement) < 0.5 &&
          Math.abs(this._glideVelocity as number) < 0.5
        ) {
          this._glideActive = false;
          this._setScroll(this._glideTarget as number);
          content.style.scrollSnapType = "";
          this._sync();
          return;
        }
        this._setScroll(location);
        this._glideFrame = requestAnimationFrame(step);
      };
      this._glideFrame = requestAnimationFrame(step);
    },

    _show(this: SpInstance, index: number): void {
      const items: HTMLElement[] = this._items();
      items.forEach((item, i) => {
        item.classList.toggle("active", i === index);
        if (i === index) item.removeAttribute("inert");
        else item.setAttribute("inert", "");
      });
      this._update(index, index === 0, index === items.length - 1, items.length);
    },

    _update(
      this: SpInstance,
      index: number,
      atStart: boolean,
      atEnd: boolean,
      count: number,
    ): void {
      this.el.style.setProperty("--sp-carousel-index", String(index));
      this.el.style.setProperty("--sp-carousel-count", String(count));
      const loop = this.config.loop as boolean;
      const previous: HTMLButtonElement[] = this._controls(".carousel-previous");
      previous.forEach((button) => {
        button.disabled = loop ? false : atStart;
      });
      const next: HTMLButtonElement[] = this._controls(".carousel-next");
      next.forEach((button) => {
        button.disabled = loop ? false : atEnd;
      });
      const pagination: HTMLElement[] = this._controls(".carousel-pagination");
      pagination.forEach((dots) => {
        [...dots.children].forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
        });
      });
      if (index !== this._index) {
        this._index = index;
        this.emit("change", { index, count });
      }
    },

    _autoplaySetup(this: SpInstance): void {
      if (!((this.config.autoplay as number) > 0) || reducedMotion()) return;
      this.on(this.el, "pointerenter", () => (this._autoplayPaused = true));
      this.on(this.el, "pointerleave", () => (this._autoplayPaused = false));
      this.on(this.el, "focusin", () => (this._autoplayPaused = true));
      this.on(this.el, "focusout", () => (this._autoplayPaused = false));
      this._autoplayStart();
    },

    _autoplayStart(this: SpInstance): void {
      clearInterval(this._autoplayTimer as number);
      this._autoplayTimer = window.setInterval(() => {
        if (this._autoplayPaused) return;
        const index = this._index as number;
        if (this.config.loop) {
          this.to(index + 1);
        } else {
          const wrap = index === this.count() - 1;
          this.to(wrap ? 0 : index + 1, wrap);
        }
      }, this.config.autoplay as number);
    },

    _sync(this: SpInstance): void {
      const content = this._content as HTMLElement;
      const items: HTMLElement[] = this._items();
      if (!content || !items.length) return;

      // A hidden carousel (closed dialog, inactive tab) measures zero;
      // keep the authored state until it can lay out.
      const size = this._vertical ? content.clientHeight : content.clientWidth;
      const total = this._vertical ? content.scrollHeight : content.scrollWidth;
      if (!total) return;

      const contentStart = this._rectStart(content.getBoundingClientRect());

      // A clone that has settled swaps for its real twin; the pixels are
      // identical so the jump is invisible. Never while a drag holds the
      // track (snap is released then).
      if (this.config.loop && content.style.scrollSnapType !== "none") {
        for (const copy of content.querySelectorAll<HTMLElement>(
          "[data-sp-clone]",
        )) {
          const distance =
            this._rectStart(copy.getBoundingClientRect()) - contentStart;
          if (Math.abs(distance) < 4) {
            const twin = items[Number(copy.getAttribute("data-sp-clone"))];
            this._jump(
              this._rectStart(twin.getBoundingClientRect()) - contentStart,
            );
            break;
          }
        }
      }

      // Clones count as their twin, so a wrap reports the destination index
      // mid-glide just like any other step.
      let index = 0;
      let nearest = Infinity;
      content.querySelectorAll<HTMLElement>(".carousel-item").forEach((slide) => {
        const distance = Math.abs(
          this._rectStart(slide.getBoundingClientRect()) - contentStart,
        );
        if (distance < nearest) {
          nearest = distance;
          const twin = slide.getAttribute("data-sp-clone");
          index = twin === null ? items.indexOf(slide) : Number(twin);
        }
      });

      const position = Math.abs(this._scrollPos());
      this._update(
        index,
        position <= 1,
        position + size >= total - 1,
        items.length,
      );
    },
  },
});
