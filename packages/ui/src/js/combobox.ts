// Anchored, filterable option list; selection state lives in each item's
// hidden radio (single select) or checkbox (multi select) input.
//
// The data-sp-toggle target is the field the user types in: an .input-group
// (or bare <input>) for single-select autocomplete, or a .combobox-chips
// container for multi select, which renders one chip per checked option.

import { define } from "./define";
import type { SpInstance } from "./define";
import { ensureId, findNextEnabled, isDisabled, resolveTrigger } from "./utils";
import { Togglable } from "./mixins/togglable";
import { ClickOutsideHide } from "./mixins/click-outside-hide";
import { FocusOutsideHide } from "./mixins/focus-outside-hide";
import { Escapable } from "./mixins/escapable";
import { Popoverable } from "./mixins/popoverable";
import { Anchorable } from "./mixins/anchorable";

const ITEM = ".combobox-item";

function itemLabel(item: HTMLElement): string {
  return (item.dataset.spLabel ?? item.textContent ?? "").trim();
}

export const Combobox = define({
  name: "combobox",
  selector: ".combobox",
  mixins: [Togglable, ClickOutsideHide, FocusOutsideHide, Escapable, Popoverable, Anchorable],

  props: {
    toggle: String,
    offset: { type: Number, default: 4 },
    // Arrow navigation only visits items the current filter left visible.
    item: { type: String, default: `${ITEM}:not([hidden])` },
    matchWidth: { type: Boolean, default: true },
    // Highlight the first match while the user types (Base UI parity: opt-in).
    autoHighlight: { type: Boolean, default: false },
  },

  init(this: SpInstance) {
    const trigger = resolveTrigger(this);
    const chips = trigger?.classList.contains("combobox-chips") ? trigger : null;
    const anchorInput = trigger?.matches("input")
      ? (trigger as HTMLInputElement)
      : (trigger?.querySelector<HTMLInputElement>("input:not([type='hidden'])") ?? null);
    const list = this.el.querySelector<HTMLElement>(".combobox-list");
    this._chips = chips;
    this._anchorInput = anchorInput;
    this._clearBtn = trigger?.querySelector<HTMLButtonElement>(".combobox-clear") ?? null;

    // WAI-ARIA combobox semantics on the field input.
    if (list && !list.hasAttribute("role")) list.setAttribute("role", "listbox");
    if (anchorInput) {
      anchorInput.setAttribute("role", "combobox");
      anchorInput.setAttribute("aria-autocomplete", "list");
      anchorInput.setAttribute("autocomplete", "off");
      anchorInput.setAttribute("aria-expanded", "false");
      if (list) anchorInput.setAttribute("aria-controls", ensureId(list));
      for (const type of ["sp-beforeshow", "sp-beforehide"]) {
        this.on(this.el, type, (e) => {
          if (e.target === this.el) {
            anchorInput.setAttribute("aria-expanded", String(type === "sp-beforeshow"));
          }
        });
      }
    }

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
      // select() re-clicks the hidden input; skip that synthetic pass.
      if (e.target instanceof HTMLInputElement) return;
      const item = (e.target as HTMLElement).closest<HTMLElement>(ITEM);
      if (!item) return;
      if (isDisabled(item)) {
        e.preventDefault();
        return;
      }
      this.select(item);
    });

    if (anchorInput && trigger) {
      // Clicking anywhere on the field focuses the input and opens the list;
      // a click never toggle-closes while the user is interacting with it.
      this.on(trigger, "click", (e) => {
        if (anchorInput.disabled) return;
        const target = e.target as HTMLElement;
        if (target.closest(".combobox-clear, .combobox-chip-remove")) return;
        anchorInput.focus();
        this.show({ trigger });
      });

      // Typing opens and filters; show() also revives a panel that is still
      // animating shut after a selection.
      this.on(anchorInput, "input", () => {
        this.show({ trigger });
        this.filter(anchorInput.value);
      });

      this.on(anchorInput, "keydown", (e) => this._anchorKeydown(e as KeyboardEvent));

      if (this._clearBtn) {
        this.on(this._clearBtn, "click", (e) => {
          e.stopPropagation();
          this.clear();
          anchorInput.focus();
        });
      }

      // The chip remove buttons are re-rendered on every change, so the
      // listener delegates from the container.
      if (chips) {
        this.on(chips, "click", (e) => {
          const remove = (e.target as HTMLElement).closest<HTMLElement>(".combobox-chip-remove");
          const item = remove ? ((remove.closest(".combobox-chip") as any)?._spItem ?? null) : null;
          if (item) this._uncheck(item);
        });
      }
    }

    // Opening always starts from the full list; typing narrows it down.
    this.on(this.el, "sp-show", (e) => {
      if (e.target === this.el) this.filter("");
    });

    this.on(this.el, "sp-hidden", (e) => {
      if (e.target !== this.el) return;
      this.filter("");
      // The field text resettles to the actual selection (Base UI focusOut
      // behavior); a chips input just empties.
      if (anchorInput) anchorInput.value = chips ? "" : this._selectedLabel();
    });

    this._renderChips();
    this._syncClear();
    if (anchorInput && !chips) anchorInput.value = this._selectedLabel();
  },

  methods: {
    filter(this: SpInstance, query: string): void {
      const normalized = query.trim().toLowerCase();
      let visibleCount = 0;

      this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
        const matches = !normalized || itemLabel(item).toLowerCase().includes(normalized);
        item.hidden = !matches;
        if (matches) visibleCount++;
      });

      // A group (label + its options) disappears when the filter empties it.
      this.el.querySelectorAll<HTMLElement>(".combobox-group").forEach((group) => {
        group.hidden = !group.querySelector(`${ITEM}:not([hidden])`);
      });

      this.el
        .querySelector<HTMLElement>(".combobox-empty")
        ?.classList.toggle("visible", visibleCount === 0);

      // With autoHighlight, a query pre-highlights its first match so Enter
      // selects it right away; otherwise the user arrows down first.
      const visible = [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
      const target =
        normalized && this.config.autoHighlight
          ? (visible.find((item) => !isDisabled(item)) ?? null)
          : null;
      if (target) this._setActive(target);
      else this._clearActive();
    },

    select(this: SpInstance, item: HTMLElement): void {
      const input = item.querySelector<HTMLInputElement>("input");
      if (!input) return;

      const multiple = input.type === "checkbox";
      // Multi select toggles; single select settles (clearing is the clear
      // button's job) and the shared radio name unchecks the previous pick.
      // click() keeps the change event native so every listener hears it,
      // including React's click-based onChange.
      if (multiple || !input.checked) input.click();
      this._syncSelected();
      this._renderChips();
      this._syncClear();

      const anchorInput = this._anchorInput as HTMLInputElement | null;
      if (this._chips) {
        if (anchorInput) {
          anchorInput.value = "";
          anchorInput.focus();
        }
        this.filter("");
      } else if (anchorInput) {
        anchorInput.value = this._selectedLabel();
        anchorInput.focus();
        this.hide();
      }
    },

    // Unchecks every option and empties the field.
    clear(this: SpInstance): void {
      this.el.querySelectorAll<HTMLInputElement>(`${ITEM} input:checked`).forEach((input) => {
        // click() unchecks a checkbox natively; radios can't un-click, so
        // they fall back to assignment plus a dispatched change.
        if (input.type === "checkbox") input.click();
        else {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      const anchorInput = this._anchorInput as HTMLInputElement | null;
      if (anchorInput) anchorInput.value = "";
      this._syncSelected();
      this._renderChips();
      this._syncClear();
      this.filter("");
    },

    _anchorKeydown(this: SpInstance, e: KeyboardEvent): void {
      const key = e.key;

      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        if (!this._isMounted()) this.show({ trigger: this.trigger });
        const items = [...this.el.querySelectorAll<HTMLElement>(this.config.item as string)];
        const current = this._activeIndex(items);
        const forward = key === "ArrowDown";
        const next =
          current < 0
            ? (forward ? items : [...items].reverse()).find((item) => !isDisabled(item))
            : findNextEnabled(items, current, forward ? 1 : -1);
        if (next) this._setActive(next);
        return;
      }

      if (key === "Enter") {
        const item = this.el.querySelector<HTMLElement>(`${ITEM}[data-sp-highlighted]`);
        if (!this._isMounted() || !item) return;
        e.preventDefault();
        if (!isDisabled(item)) this.select(item);
        return;
      }

      // Backspace in an empty chips field removes the newest chip.
      if (key === "Backspace" && this._chips) {
        const input = this._anchorInput as HTMLInputElement;
        if (input.value !== "") return;
        const checked = this.el.querySelectorAll<HTMLInputElement>(`${ITEM} input:checked`);
        const last = checked[checked.length - 1]?.closest<HTMLElement>(ITEM);
        if (last) this._uncheck(last);
      }
    },

    _uncheck(this: SpInstance, item: HTMLElement): void {
      const input = item.querySelector<HTMLInputElement>("input");
      if (!input) return;
      if (input.type === "checkbox" && input.checked) input.click();
      else {
        input.checked = false;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this._syncSelected();
      this._renderChips();
      this._syncClear();
      (this._anchorInput as HTMLInputElement | null)?.focus();
    },

    _syncSelected(this: SpInstance): void {
      this.el.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
        const input = item.querySelector<HTMLInputElement>("input");
        if (input) item.setAttribute("aria-selected", String(input.checked));
      });
    },

    _selectedLabel(this: SpInstance): string {
      const input = this.el.querySelector<HTMLInputElement>(`${ITEM} input:checked`);
      const item = input?.closest<HTMLElement>(ITEM);
      return item ? itemLabel(item) : "";
    },

    _checkedItems(this: SpInstance): HTMLElement[] {
      return [...this.el.querySelectorAll<HTMLInputElement>(`${ITEM} input:checked`)]
        .map((input) => input.closest<HTMLElement>(ITEM))
        .filter((item): item is HTMLElement => item !== null);
    },

    // One chip per checked option, rendered before the chips input; the chip
    // keeps a reference to its option so the remove button can uncheck it.
    _renderChips(this: SpInstance): void {
      const chips = this._chips as HTMLElement | null;
      if (!chips) return;
      chips.querySelectorAll(".combobox-chip").forEach((chip) => chip.remove());
      const input = chips.querySelector<HTMLElement>("input");

      for (const item of this._checkedItems()) {
        const chip = document.createElement("span");
        chip.className = "combobox-chip";
        chip.append(itemLabel(item));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "combobox-chip-remove";
        remove.setAttribute("aria-label", `Remove ${itemLabel(item)}`);
        remove.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
        (chip as any)._spItem = item;
        chip.append(remove);
        if (input) chips.insertBefore(chip, input);
        else chips.append(chip);
      }
    },

    _syncClear(this: SpInstance): void {
      const clear = this._clearBtn as HTMLElement | null;
      if (clear) clear.hidden = this._checkedItems().length === 0;
    },

    // Virtual highlight (cmdk-style): focus stays in the field while
    // aria-activedescendant and [data-sp-highlighted] track the active option.
    _activeIndex(this: SpInstance, items: HTMLElement[]): number {
      return items.findIndex((item) => item.hasAttribute("data-sp-highlighted"));
    },

    _setActive(this: SpInstance, item: HTMLElement): void {
      this.el.querySelector(`${ITEM}[data-sp-highlighted]`)?.removeAttribute("data-sp-highlighted");
      item.setAttribute("data-sp-highlighted", "");
      (this._anchorInput as HTMLElement | null)?.setAttribute(
        "aria-activedescendant",
        ensureId(item),
      );
      item.scrollIntoView({ block: "nearest" });
    },

    _clearActive(this: SpInstance): void {
      this.el.querySelector(`${ITEM}[data-sp-highlighted]`)?.removeAttribute("data-sp-highlighted");
      (this._anchorInput as HTMLElement | null)?.removeAttribute("aria-activedescendant");
    },
  },
});
