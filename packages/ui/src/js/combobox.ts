// Anchored, filterable option list; selection state lives in each item's
// hidden radio (single select) or checkbox (multi select) input.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, isDisabled, resolveTrigger } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickToShow } from "./mixins/click-to-show";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { FocusOutsideHide } from "./mixins/focus-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Navigable } from "./mixins/navigable";
import { Popoverable } from "./mixins/popoverable";
import { Anchorable } from "./mixins/anchorable";

const ITEM = ".combobox-item";

export const Combobox = define({
  name: "combobox",
  selector: ".combobox",
  mixins: [
    Togglable,
    ClickToShow,
    ClickOutsideHide,
    FocusOutsideHide,
    Escapable,
    Navigable,
    Popoverable,
    Anchorable,
  ],

  props: {
    offset: { type: Number, default: 4 },
    // Arrow navigation only visits items the current filter left visible.
    item: { type: String, default: `${ITEM}:not([hidden])` },
    matchWidth: { type: Boolean, default: true },
  },

  init(this: SpInstance) {
    // WAI-ARIA combobox (dialog popup) semantics, applied unless authored.
    const trigger = resolveTrigger(this);
    trigger?.setAttribute("aria-haspopup", "dialog");
    if (trigger && !trigger.hasAttribute("role")) trigger.setAttribute("role", "combobox");
    if (!this.el.hasAttribute("role")) this.el.setAttribute("role", "dialog");
    if (trigger && !this.el.hasAttribute("aria-label") && !this.el.hasAttribute("aria-labelledby")) {
      this.el.setAttribute("aria-labelledby", ensureId(trigger));
    }

    const input = this.el.querySelector<HTMLInputElement>(".combobox-input");
    const list = this.el.querySelector<HTMLElement>(".combobox-list");
    if (input) {
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "true");
      if (list) input.setAttribute("aria-controls", ensureId(list));
    }
    if (list && !list.hasAttribute("role")) list.setAttribute("role", "listbox");
    this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
      if (!item.hasAttribute("role")) item.setAttribute("role", "option");
      // Options are highlighted via aria-activedescendant, never focused; the
      // state-holding input stays out of the tab order too.
      item.tabIndex = -1;
      const input = item.querySelector<HTMLInputElement>("input");
      if (input) {
        input.tabIndex = -1;
        // aria-selected follows the input's checked state; authors only set checked.
        item.setAttribute("aria-selected", String(input.checked));
      }
    });

    this.on(this.el, "click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(ITEM);
      if (!item) return;
      if (isDisabled(item)) {
        e.preventDefault();
        return;
      }
      this.select(item);
    });

    this.on(this.el, "keydown", (e) => {
      if ((e as KeyboardEvent).key !== "Enter") return;
      const item = this.el.querySelector<HTMLElement>(`${ITEM}[data-highlighted]`);
      if (!item) return;
      e.preventDefault();
      if (!isDisabled(item)) this.select(item);
    });

    this.on(this.el, "input", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.matches(".combobox-input")) this.filter(target.value);
    });

    this.on(this.el, "sp-show", () => {
      input?.focus();
    });

    this.on(this.el, "sp-hidden", () => {
      this.filter("");
      if (input) input.value = "";
    });
  },

  methods: {
    filter(this: SpInstance, query: string): void {
      const normalized = query.trim().toLowerCase();
      let visibleCount = 0;

      this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
        const text = (item.dataset.label ?? item.textContent ?? "").trim().toLowerCase();
        const matches = !normalized || text.includes(normalized);
        item.hidden = !matches;
        if (matches) visibleCount++;
      });

      this.el
        .querySelector<HTMLElement>(".combobox-empty")
        ?.classList.toggle("visible", visibleCount === 0);

      // A query highlights its first match (so Enter selects it right away);
      // an empty one clears the highlight back to the untouched-list state.
      const visible = [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
      const target = normalized ? visible.find((item) => !isDisabled(item)) : null;
      if (target) this._setActive(target);
      else this._clearActive();
    },

    select(this: SpInstance, item: HTMLElement): void {
      const input = item.querySelector<HTMLInputElement>("input");
      if (!input) return;

      const multiple = input.type === "checkbox";

      if (!multiple) {
        this.el.querySelectorAll<HTMLElement>(ITEM).forEach((el) => {
          el.setAttribute("aria-selected", "false");
        });
      }

      // Re-selecting the selected option clears it, so the empty initial
      // state stays reachable for optional fields.
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      item.setAttribute("aria-selected", String(input.checked));
      this._updateValue();

      if (!multiple) this.hide();
    },

    // Arrows come from the search input, not from the options.
    _navigates(): boolean {
      return true;
    },

    // Virtual highlight (cmdk-style): focus stays in the search input while
    // aria-activedescendant and [data-highlighted] track the active option.
    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.findIndex((item) => item.hasAttribute("data-highlighted"));
    },

    _setActive(this: SpInstance, item: HTMLElement): void {
      this.el.querySelector(`${ITEM}[data-highlighted]`)?.removeAttribute("data-highlighted");
      item.setAttribute("data-highlighted", "");
      this.el
        .querySelector(".combobox-input")
        ?.setAttribute("aria-activedescendant", ensureId(item));
      item.scrollIntoView({ block: "nearest" });
    },

    _clearActive(this: SpInstance): void {
      this.el.querySelector(`${ITEM}[data-highlighted]`)?.removeAttribute("data-highlighted");
      this.el.querySelector(".combobox-input")?.removeAttribute("aria-activedescendant");
    },

    // One span per checked item: the CSS collapses 2+ of them into "N selected".
    _updateValue(this: SpInstance): void {
      const valueEl: HTMLElement | null = this.trigger?.querySelector(".combobox-value") ?? null;
      if (!valueEl) return;

      const labels = [...this.el.querySelectorAll<HTMLInputElement>(`${ITEM} input:checked`)].map(
        (input) => input.closest<HTMLElement>(ITEM)?.textContent?.trim() ?? "",
      );
      valueEl.replaceChildren(
        ...labels.map((text) => {
          const span = document.createElement("span");
          span.textContent = text;
          return span;
        }),
      );
    },
  },
});
