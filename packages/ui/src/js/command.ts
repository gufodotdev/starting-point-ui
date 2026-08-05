// Command palette: a filterable action list with a virtual highlight;
// selecting an item fires sp-select.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, isDisabled } from "./utils";
import { Navigable } from "./mixins/navigable";

const ITEM = ".command-item";

function itemLabel(item: HTMLElement): string {
  return (item.dataset.spLabel ?? item.textContent ?? "").trim();
}

export const Command = define({
  name: "command",
  selector: ".command",
  mixins: [Navigable],

  props: {
    item: { type: String, default: `${ITEM}:not([hidden])` },
    filter: { type: Boolean, default: true },
  },

  init(this: SpInstance) {
    const input = this.el.querySelector<HTMLInputElement>("input");
    const list = this.el.querySelector<HTMLElement>(".command-list");
    this._input = input;

    if (list) {
      if (!list.hasAttribute("role")) list.setAttribute("role", "listbox");
      // The listbox role requires an accessible name.
      if (!list.hasAttribute("aria-label") && !list.hasAttribute("aria-labelledby")) {
        list.setAttribute("aria-label", "Suggestions");
      }
    }
    if (input) {
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("autocomplete", "off");
      input.setAttribute("aria-expanded", "true");
      if (list) input.setAttribute("aria-controls", ensureId(list));
    }

    // Pressing an item must not blur the input: on mobile the blur dismisses
    // the keyboard and the resulting layout shift moves the item away before
    // the click lands. iOS can emit the mousedown without a pointerdown.
    for (const type of ["pointerdown", "mousedown"]) {
      this.on(this.el, type, (e) => {
        if ((e.target as HTMLElement).closest(ITEM)) e.preventDefault();
      });
    }

    this.on(this.el, "click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(ITEM);
      if (!item || isDisabled(item)) return;
      // Touch has no hover; the tap itself moves the highlight.
      this._setActive(item, false);
      this.run(item);
    });

    // Scrolling emits a synthetic pointermove with unchanged coordinates; only
    // real movement may move the highlight.
    this.on(this.el, "pointermove", (e) => {
      const { clientX, clientY, pointerType } = e as PointerEvent;
      if (pointerType === "touch") return;
      if (clientX === this._pointerX && clientY === this._pointerY) return;
      this._pointerX = clientX;
      this._pointerY = clientY;
      const item = (e.target as HTMLElement).closest<HTMLElement>(ITEM);
      if (!item || isDisabled(item) || item.hasAttribute("data-sp-highlighted")) return;
      this._setActive(item, false);
    });

    if (input) {
      this.on(input, "input", () => this._sync());
      this.on(input, "keydown", (e) => {
        if ((e as KeyboardEvent).key !== "Enter") return;
        const active = this.el.querySelector<HTMLElement>(`${ITEM}[data-sp-highlighted]`);
        if (active) {
          e.preventDefault();
          this.run(active);
        }
      });
    }

    // Items rendered later (async search results) get wired and highlighted
    // as they appear.
    this._observer = new MutationObserver(() => this._sync());
    this._observer.observe(list ?? this.el, { childList: true, subtree: true });

    // Highlight the first item so Enter works before the user arrows down.
    this._sync();
  },

  destroy(this: SpInstance) {
    (this._observer as MutationObserver | undefined)?.disconnect();
  },

  methods: {
    filter(this: SpInstance, query: string): void {
      const normalized = query.trim().toLowerCase();

      this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
        item.hidden = !!normalized && !itemLabel(item).toLowerCase().includes(normalized);
      });

      this.el.querySelectorAll<HTMLElement>(".command-group").forEach((group) => {
        group.hidden = !group.querySelector(`${ITEM}:not([hidden])`);
      });

      // Separators only make sense between full groups; any query hides them.
      this.el.querySelectorAll<HTMLElement>(".command-separator").forEach((sep) => {
        sep.hidden = !!normalized;
      });

      this.refresh();
    },

    // Runs automatically when the list mutates, so apps driving items from an
    // external search only need data-sp-filter="false".
    refresh(this: SpInstance): void {
      this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
        if (!item.hasAttribute("role")) item.setAttribute("role", "option");
        item.tabIndex = -1;
      });

      this.el.querySelectorAll<HTMLElement>(".command-separator").forEach((sep) => {
        if (!sep.hasAttribute("role")) sep.setAttribute("role", "separator");
      });

      this.el.querySelectorAll<HTMLElement>(".command-group").forEach((group) => {
        if (!group.hasAttribute("role")) group.setAttribute("role", "group");
        const label = group.querySelector<HTMLElement>(".command-label");
        if (label && !group.hasAttribute("aria-labelledby")) {
          group.setAttribute("aria-labelledby", ensureId(label));
        }
      });

      const visible = [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];

      this.el
        .querySelector<HTMLElement>(".command-empty")
        ?.classList.toggle("visible", visible.length === 0);

      // Keep a still-valid highlight so an authored data-sp-highlighted
      // survives init; _setActive adds the aria wiring markup can't.
      const current = this.el.querySelector<HTMLElement>(`${ITEM}[data-sp-highlighted]`);
      if (current && visible.includes(current) && !isDisabled(current)) {
        this._setActive(current);
        return;
      }
      const target = visible.find((item) => !isDisabled(item)) ?? null;
      if (target) this._setActive(target);
      else this._clearActive();
    },

    _sync(this: SpInstance): void {
      if (this.config.filter) {
        this.filter((this._input as HTMLInputElement | null)?.value ?? "");
      } else {
        this.refresh();
      }
    },

    run(this: SpInstance, item: HTMLElement): void {
      this.emit("select", { item, value: item.dataset.spValue ?? itemLabel(item) });
    },

    // Arrows typed in the search field drive the list navigation too.
    _navigates(this: SpInstance, target: HTMLElement): boolean {
      return target === this._input || !!target.closest(this.config.item as string);
    },

    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.findIndex((item) => item.hasAttribute("data-sp-highlighted"));
    },

    // A pointer-set highlight must not scroll the list under the cursor.
    _setActive(this: SpInstance, item: HTMLElement, scroll = true): void {
      this.el.querySelectorAll(`${ITEM}[data-sp-highlighted]`).forEach((prev) => {
        prev.removeAttribute("data-sp-highlighted");
        prev.removeAttribute("aria-selected");
      });
      item.setAttribute("data-sp-highlighted", "");
      item.setAttribute("aria-selected", "true");
      (this._input as HTMLElement | null)?.setAttribute("aria-activedescendant", ensureId(item));
      // The initial highlight on page load must not scroll the document.
      if (scroll && this.el.contains(document.activeElement)) {
        item.scrollIntoView({ block: "nearest" });
      }
    },

    _clearActive(this: SpInstance): void {
      this.el.querySelectorAll(`${ITEM}[data-sp-highlighted]`).forEach((prev) => {
        prev.removeAttribute("data-sp-highlighted");
        prev.removeAttribute("aria-selected");
      });
      (this._input as HTMLElement | null)?.removeAttribute("aria-activedescendant");
    },

    // Navigable gates on the panel lifecycle; a command has none, it is
    // always mounted and visible.
    _isMounted(this: SpInstance): boolean {
      return true;
    },
    _isShown(this: SpInstance): boolean {
      return true;
    },
  },
});
