// Message scroller: a conversation viewport that follows new messages at the
// live edge, keeps the reader's place when history loads in, and pins newly
// appended turns to the top; state changes fire sp-change.

import { define } from "./define";
import type { SpInstance } from "./define";

const EPSILON = 0.5;
const AUTOSCROLL_CLEAR_MS = 180;
const INTENT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

type ScrollToOptions = {
  align?: "start" | "center" | "end" | "nearest";
  behavior?: ScrollBehavior;
  scrollMargin?: number;
};

export const MessageScroller = define({
  name: "message-scroller",
  selector: ".message-scroller",

  props: {
    autoScroll: Boolean,
    position: String,
    edgeThreshold: { type: Number, default: 8 },
    margin: { type: Number, default: 0 },
    peek: { type: Number, default: 64 },
    preservePrepend: { type: Boolean, default: true },
  },

  init(this: SpInstance) {
    const viewport = this.el.querySelector<HTMLElement>(
      ".message-scroller-viewport",
    );
    const content = this.el.querySelector<HTMLElement>(
      ".message-scroller-content",
    );
    if (!viewport || !content) return;
    this._viewport = viewport;
    this._content = content;

    if (!viewport.hasAttribute("role")) viewport.setAttribute("role", "region");
    if (!viewport.hasAttribute("aria-label")) {
      viewport.setAttribute("aria-label", "Messages");
    }
    if (!viewport.hasAttribute("tabindex")) viewport.tabIndex = 0;
    if (!content.hasAttribute("role")) content.setAttribute("role", "log");
    if (!content.hasAttribute("aria-relevant")) {
      content.setAttribute("aria-relevant", "additions");
    }

    const spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    spacer.hidden = true;
    content.append(spacer);
    this._spacer = spacer;

    this._mode = this.config.autoScroll ? "following" : "free";
    this._lastTop = 0;
    this._autoscrolling = false;
    this._spacerHeight = 0;
    this._count = 0;
    this._firstItem = null;
    this._turn = null;
    this._prependRestore = null;
    this._pendingMessage = null;
    this._positionApplied = false;
    this._handledAnchors = new WeakSet();
    this._visible = new Set();
    this._snapshot = "";

    const buttons: HTMLElement[] = [
      ...this.el.querySelectorAll<HTMLElement>(".message-scroller-button"),
    ].filter((b) => b.closest(".message-scroller") === this.el);
    this._buttons = buttons;
    buttons.forEach((button) => {
      const start = button.classList.contains("message-scroller-button-start");
      this.on(button, "click", () => {
        if (start) this.scrollToStart({ behavior: "smooth" });
        else this.scrollToEnd({ behavior: "smooth" });
      });
    });

    this.on(viewport, "scroll", () => this._syncAfterScroll());
    this.on(viewport, "wheel", () => this._intent());
    this.on(viewport, "touchmove", () => this._intent());
    this.on(viewport, "keydown", (e) => {
      if (INTENT_KEYS.has((e as KeyboardEvent).key)) this._intent();
    });

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this._resizeFrame as number);
      if (this._mode === "following" && this.config.autoScroll) {
        this._handleResize();
        return;
      }
      this._resizeFrame = requestAnimationFrame(() => this._handleResize());
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    this._resizeObserver = resizeObserver;

    const mutationObserver = new MutationObserver(() =>
      this._handleContentChange(),
    );
    mutationObserver.observe(content, { childList: true });
    this._mutationObserver = mutationObserver;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) (this._visible as Set<string>).add(id);
          else (this._visible as Set<string>).delete(id);
        }
        this._scheduleCommit();
      },
      {
        root: viewport,
        rootMargin: `${-((this.config.margin as number) + (this.config.peek as number))}px 0px 0px 0px`,
        threshold: [0, 0.01, 0.5, 1],
      },
    );
    this._io = io;

    this._handleContentChange();
  },

  destroy(this: SpInstance) {
    (this._resizeObserver as ResizeObserver | undefined)?.disconnect();
    (this._mutationObserver as MutationObserver | undefined)?.disconnect();
    (this._io as IntersectionObserver | undefined)?.disconnect();
    cancelAnimationFrame(this._commitFrame as number);
    cancelAnimationFrame(this._resizeFrame as number);
    clearTimeout(this._autoscrollTimer as number);
    (this._spacer as HTMLElement | undefined)?.remove();
  },

  methods: {
    _items(this: SpInstance): HTMLElement[] {
      const content = this._content as HTMLElement | undefined;
      if (!content) return [];
      return [...content.children].filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child !== this._spacer,
      );
    },

    _observeItems(this: SpInstance): void {
      const io = this._io as IntersectionObserver;
      io.disconnect();
      (this._visible as Set<string>).clear();
      const items: HTMLElement[] = this._items();
      items.forEach((item) => io.observe(item));
    },

    // Content height measured to the last item, so the spacer never counts
    // toward the scrollable range.
    _realHeight(this: SpInstance): number {
      const viewport = this._viewport as HTMLElement;
      const styles = getComputedStyle(viewport);
      const padStart = parseFloat(styles.paddingBlockStart) || 0;
      const padEnd = parseFloat(styles.paddingBlockEnd) || 0;
      const box = viewport.getBoundingClientRect();
      let height = padStart + padEnd;
      const items: HTMLElement[] = this._items();
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        height = Math.max(
          height,
          rect.bottom - box.top + viewport.scrollTop + padEnd,
        );
      }
      return height;
    },

    _scrollable(this: SpInstance): { start: boolean; end: boolean } {
      const viewport = this._viewport as HTMLElement;
      const threshold = this.config.edgeThreshold as number;
      return {
        start: viewport.scrollTop > threshold,
        end:
          this._realHeight() - viewport.scrollTop - viewport.clientHeight >
          threshold,
      };
    },

    _currentAnchorId(this: SpInstance): string | null {
      const viewport = this._viewport as HTMLElement;
      const limit =
        viewport.getBoundingClientRect().top +
        (this.config.margin as number) +
        (this.config.peek as number) +
        EPSILON;
      let current: string | null = null;
      for (const item of this._items()) {
        if (!item.hasAttribute("data-sp-anchor") || !item.id) continue;
        if (item.getBoundingClientRect().top <= limit) current = item.id;
      }
      return current;
    },

    _syncMode(this: SpInstance, scrollable: { end: boolean }): void {
      const viewport = this._viewport as HTMLElement;
      const goingUp = viewport.scrollTop < (this._lastTop as number) - EPSILON;
      this._lastTop = viewport.scrollTop;
      if (
        this.config.autoScroll &&
        !scrollable.end &&
        this._mode !== "settling" &&
        this._mode !== "anchored"
      ) {
        this._mode = "following";
      } else if (
        this._mode === "following" &&
        scrollable.end &&
        goingUp &&
        !this._autoscrolling
      ) {
        this._mode = "free";
      }
    },

    _commit(this: SpInstance): void {
      const viewport = this._viewport as HTMLElement;
      const scrollable = this._scrollable();
      this._syncMode(scrollable);
      const committed =
        this._mode === "following" ? { ...scrollable, end: false } : scrollable;
      const value = [committed.start && "start", committed.end && "end"]
        .filter(Boolean)
        .join(" ");
      for (const target of [this.el, viewport]) {
        if (value) target.setAttribute("data-sp-scrollable", value);
        else target.removeAttribute("data-sp-scrollable");
        target.toggleAttribute(
          "data-sp-autoscrolling",
          this._autoscrolling as boolean,
        );
      }
      (this._buttons as HTMLElement[]).forEach((button) => {
        const start = button.classList.contains("message-scroller-button-start");
        button.classList.toggle(
          "active",
          start ? committed.start : committed.end,
        );
      });
      const currentAnchorId = this._currentAnchorId();
      const visible = this._visible as Set<string>;
      const allItems: HTMLElement[] = this._items();
      const visibleMessageIds = allItems
        .map((item) => item.id)
        .filter((id) => id && visible.has(id));
      const snapshot = JSON.stringify([
        committed,
        currentAnchorId,
        visibleMessageIds,
      ]);
      if (snapshot !== this._snapshot) {
        this._snapshot = snapshot;
        this.emit("change", {
          scrollable: committed,
          currentAnchorId,
          visibleMessageIds,
        });
      }
    },

    _scheduleCommit(this: SpInstance): void {
      cancelAnimationFrame(this._commitFrame as number);
      this._commitFrame = requestAnimationFrame(() => this._commit());
    },

    _intent(this: SpInstance): void {
      if (
        this._mode === "following" ||
        this._mode === "anchored" ||
        this._mode === "settling"
      ) {
        this._turn = null;
        this._mode = "free";
      }
    },

    _setAutoscrolling(this: SpInstance, active: boolean): void {
      clearTimeout(this._autoscrollTimer as number);
      if (this._autoscrolling !== active) {
        this._autoscrolling = active;
        this._commit();
      }
      if (active) {
        this._autoscrollTimer = window.setTimeout(() => {
          this._autoscrolling = false;
          this._commit();
        }, AUTOSCROLL_CLEAR_MS);
      }
    },

    _setSpacer(this: SpInstance, height: number): void {
      const spacer = this._spacer as HTMLElement;
      const next = Math.max(0, Math.ceil(height));
      if (this._spacerHeight === next) return;
      this._spacerHeight = next;
      spacer.hidden = next === 0;
      spacer.style.height = `${next}px`;
      const content = this._content as HTMLElement;
      const styles = getComputedStyle(content);
      const gap =
        parseFloat(styles.rowGap === "normal" ? styles.gap : styles.rowGap) || 0;
      spacer.style.marginTop = next > 0 ? `${-gap}px` : "";
    },

    _scrollTo(
      this: SpInstance,
      top: number,
      behavior: ScrollBehavior,
      autoscrolling = false,
    ): void {
      const viewport = this._viewport as HTMLElement;
      const target = Math.max(0, top);
      if (Math.abs(viewport.scrollTop - target) <= EPSILON) {
        viewport.scrollTop = target;
        this._commit();
        return;
      }
      if (autoscrolling && behavior === "smooth") this._setAutoscrolling(true);
      viewport.scrollTo({ top: target, behavior });
      this._scheduleCommit();
    },

    _maxScroll(this: SpInstance): number {
      const viewport = this._viewport as HTMLElement;
      return Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    },

    scrollToStart(this: SpInstance, options: ScrollToOptions = {}): boolean {
      if (!this._viewport) return false;
      this._setSpacer(0);
      this._turn = null;
      this._mode = "free";
      this._scrollTo(0, options.behavior ?? "auto");
      return true;
    },

    scrollToEnd(this: SpInstance, options: ScrollToOptions = {}): boolean {
      if (!this._viewport) return false;
      this._setSpacer(0);
      this._turn = null;
      this._mode = this.config.autoScroll ? "following" : "free";
      this._scrollTo(this._maxScroll(), options.behavior ?? "auto", true);
      return true;
    },

    _alignTarget(
      this: SpInstance,
      element: HTMLElement,
      align: string,
      margin: number,
    ): number {
      const viewport = this._viewport as HTMLElement;
      const styles = getComputedStyle(viewport);
      const padStart = parseFloat(styles.paddingBlockStart) || 0;
      const padEnd = parseFloat(styles.paddingBlockEnd) || 0;
      const top =
        element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop;
      const height = element.getBoundingClientRect().height;
      if (align === "center") {
        const space = Math.max(0, viewport.clientHeight - padStart - padEnd);
        return top - padStart - (space - height) / 2 - margin;
      }
      if (align === "end") {
        return top - viewport.clientHeight + height + padEnd + margin;
      }
      if (align === "nearest") {
        const bottom = top + height;
        const viewStart = viewport.scrollTop + padStart;
        const viewEnd = viewport.scrollTop + viewport.clientHeight - padEnd;
        if (top >= viewStart && bottom <= viewEnd) return viewport.scrollTop;
        if (top < viewStart) return top - padStart - margin;
        return bottom - viewport.clientHeight + padEnd + margin;
      }
      return top - padStart - margin;
    },

    _scrollToElement(
      this: SpInstance,
      element: HTMLElement,
      options: ScrollToOptions = {},
      keepPreviousPeek = false,
    ): boolean {
      const viewport = this._viewport as HTMLElement;
      const content = this._content as HTMLElement;
      if (!viewport || !content || !content.contains(element)) return false;
      const margin =
        (options.scrollMargin ?? (this.config.margin as number)) +
        (keepPreviousPeek ? (this.config.peek as number) : 0);
      const target = this._alignTarget(
        element,
        options.align ?? "start",
        margin,
      );
      this._setSpacer(target + viewport.clientHeight - this._realHeight());
      this._prependRestore = {
        element,
        viewportTop:
          element.getBoundingClientRect().top -
          viewport.getBoundingClientRect().top,
      };
      this._mode = keepPreviousPeek ? "anchored" : "settling";
      this._turn = keepPreviousPeek ? element : null;
      this._scrollTo(target, options.behavior ?? "auto");
      return true;
    },

    scrollToMessage(
      this: SpInstance,
      id: string,
      options: ScrollToOptions = {},
    ): boolean {
      const content = this._content as HTMLElement | undefined;
      if (!content) return false;
      const items: HTMLElement[] = this._items();
      const element = items.find((item) => item.id === id);
      if (element) {
        this._positionApplied = true;
        return this._scrollToElement(element, options);
      }
      if (this._count === 0) {
        this._pendingMessage = { id, options };
        this._positionApplied = true;
        return true;
      }
      return false;
    },

    _flushPendingMessage(this: SpInstance): boolean {
      const pending = this._pendingMessage as {
        id: string;
        options: ScrollToOptions;
      } | null;
      if (!pending) return false;
      const items: HTMLElement[] = this._items();
      const element = items.find((item) => item.id === pending.id);
      if (!element || !this._scrollToElement(element, pending.options)) {
        return false;
      }
      this._pendingMessage = null;
      return true;
    },

    _firstVisibleItem(this: SpInstance): HTMLElement | null {
      const viewport = this._viewport as HTMLElement;
      const box = viewport.getBoundingClientRect();
      for (const item of this._items()) {
        const rect = item.getBoundingClientRect();
        if (rect.bottom > box.top && rect.top < box.bottom) return item;
      }
      return null;
    },

    _refreshPrependRestore(this: SpInstance): void {
      const viewport = this._viewport as HTMLElement;
      const first = this._firstVisibleItem();
      this._prependRestore = first
        ? {
            element: first,
            viewportTop:
              first.getBoundingClientRect().top -
              viewport.getBoundingClientRect().top,
          }
        : null;
    },

    _restoreAfterPrepend(this: SpInstance): boolean {
      const restore = this._prependRestore as {
        element: HTMLElement;
        viewportTop: number;
      } | null;
      const viewport = this._viewport as HTMLElement;
      if (!restore || !restore.element.isConnected) return false;
      const delta =
        restore.element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        restore.viewportTop;
      if (Math.abs(delta) <= EPSILON) return false;
      viewport.scrollTop += delta;
      restore.viewportTop =
        restore.element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top;
      this._scheduleCommit();
      return true;
    },

    _applyInitialPosition(this: SpInstance): boolean {
      const position = (this.config.position as string) || "end";
      const all: HTMLElement[] = this._items();
      if (this._positionApplied || all.length === 0) return false;
      let applied: boolean;
      if (position === "last-anchor") {
        const anchors = all.filter((item) =>
          item.hasAttribute("data-sp-anchor"),
        );
        const last = anchors[anchors.length - 1];
        if (!last) {
          applied = this.scrollToEnd();
        } else {
          const viewport = this._viewport as HTMLElement;
          const below =
            this._realHeight() - this._alignTarget(last, "start", 0);
          applied =
            below <= viewport.clientHeight
              ? this.scrollToEnd()
              : this._scrollToElement(last, { align: "start" }, true);
        }
      } else if (position === "start") {
        applied = this.scrollToStart();
      } else {
        applied = this.scrollToEnd();
      }
      if (applied) this._positionApplied = true;
      return applied;
    },

    _handleContentChange(this: SpInstance): void {
      const items: HTMLElement[] = this._items();
      const previousCount = this._count as number;
      const previousFirst = this._firstItem as HTMLElement | null;
      const handled = this._handledAnchors as WeakSet<HTMLElement>;
      this._count = items.length;
      this._firstItem = items[0] ?? null;
      this._observeItems();

      const settle = (): void => {
        if (this._flushPendingMessage()) return;
        if (previousCount === 0) {
          if (this._applyInitialPosition()) return;
          if (items.length > 0 && this.config.autoScroll) {
            this.scrollToEnd();
            return;
          }
          this._commit();
          return;
        }
        const previousIndex = previousFirst ? items.indexOf(previousFirst) : -1;
        if (this.config.preservePrepend && previousIndex > 0) {
          this._restoreAfterPrepend();
          return;
        }
        const fresh = items.filter(
          (item) => item.hasAttribute("data-sp-anchor") && !handled.has(item),
        );
        if (fresh.length > 0) {
          if (
            this.config.autoScroll &&
            this._mode === "following" &&
            fresh.length > 1
          ) {
            this.scrollToEnd();
            return;
          }
          this._scrollToElement(fresh[0], { align: "start" }, true);
          return;
        }
        if (this._mode === "following" && this.config.autoScroll) {
          this.scrollToEnd();
          return;
        }
        this._commit();
      };
      settle();
      this._refreshPrependRestore();
      for (const item of items) {
        if (item.hasAttribute("data-sp-anchor")) handled.add(item);
      }
    },

    _handleResize(this: SpInstance): void {
      if (this._mode === "following" && this.config.autoScroll) {
        this.scrollToEnd();
        return;
      }
      const turn = this._turn as HTMLElement | null;
      if (this._mode === "anchored" && turn?.isConnected) {
        const hadSpacer = (this._spacerHeight as number) > 0;
        this._scrollToElement(turn, { align: "start" }, true);
        if (
          hadSpacer &&
          this._spacerHeight === 0 &&
          this.config.autoScroll
        ) {
          this.scrollToEnd();
        }
        return;
      }
      this._commit();
    },

    _syncAfterScroll(this: SpInstance): void {
      this._scheduleCommit();
      this._refreshPrependRestore();
    },
  },
});
