import { define } from "./define";
import type { SpInstance } from "./define";

function deactivate(el: HTMLElement) {
  el.querySelectorAll(":scope > span").forEach((box) => box.classList.remove("active", "caret"));
}

// [0-9]{6} or \d{6} becomes [0-9] or \d, to test single typed characters.
function characterPattern(pattern: string): RegExp | null {
  const match = /^(\[[^\]]+\]|\\[dw])\{\d+(,\d*)?\}$/.exec(pattern);
  return match ? new RegExp(`^${match[1]}$`) : null;
}

export const InputOtp = define({
  name: "inputOtp",
  selector: ".input-otp",

  init(this: SpInstance) {
    const input = this.el.querySelector<HTMLInputElement>(":scope > input");
    if (!input) return;
    let previous: [number, number] = [input.selectionStart ?? 0, input.selectionEnd ?? 0];
    let length = input.value.length;

    const boxes = () => [...this.el.querySelectorAll<HTMLElement>(":scope > span")];
    const max = () => (input.maxLength > 0 ? input.maxLength : boxes().length);

    const sync = () => {
      if (document.activeElement !== input) {
        deactivate(this.el);
        return;
      }
      let start = input.selectionStart ?? 0;
      let end = input.selectionEnd ?? 0;
      const size = input.value.length;
      // A caret on a typed character selects it, so typing replaces it.
      if (size > 0 && start === end && !(start === size && size < max())) {
        let direction: "forward" | "backward" = "forward";
        if (start === max()) {
          start -= 1;
          direction = "backward";
        } else if (start > 0) {
          const backward = start < previous[1];
          direction = backward ? "backward" : "forward";
          if (backward && !(previous[0] === previous[1] && previous[0] < max())) start -= 1;
        }
        end = start + 1;
        input.setSelectionRange(start, end, direction);
      }
      previous = [start, end];
      boxes().forEach((box, i) => {
        box.classList.toggle("active", start === end ? i === start : i >= start && i < end);
        box.classList.toggle("caret", start === end && i === start);
      });
    };

    // A value set from script fires no event.
    let seen = input.value;
    const watch = () => {
      if (input.value !== seen) {
        seen = input.value;
        sync();
      }
      this._frame = requestAnimationFrame(watch);
    };

    this.on(input, "focus", () => {
      const size = input.value.length;
      input.setSelectionRange(Math.min(size, max() - 1), size);
      sync();
      seen = input.value;
      this._frame = requestAnimationFrame(watch);
    });
    this.on(input, "blur", () => {
      cancelAnimationFrame(this._frame);
      sync();
    });
    this.on(document, "selectionchange", sync);
    this.on(input, "beforeinput", (e) => {
      const allowed = characterPattern(input.pattern);
      const data = (e as InputEvent).data;
      if (allowed && data && ![...data].every((char) => allowed.test(char))) e.preventDefault();
    });
    this.on(input, "input", () => {
      sync();
      if (input.value.length >= max() && length < max()) this.emit("complete", { value: input.value });
      length = input.value.length;
    });
    this.on(this.el, "click", (e) => {
      const index = boxes().indexOf((e.target as Element).closest("span") as HTMLElement);
      if (index < 0 || input.disabled) return;
      input.focus();
      const size = input.value.length;
      if (index < size) input.setSelectionRange(index, index + 1);
      else input.setSelectionRange(Math.min(size, max() - 1), size);
      sync();
    });
  },

  destroy(this: SpInstance) {
    cancelAnimationFrame(this._frame);
    deactivate(this.el);
  },
});
