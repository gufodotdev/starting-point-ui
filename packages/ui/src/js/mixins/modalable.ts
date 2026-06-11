// Modal mechanism via a native <dialog> (showModal). Also owns the modal's
// native dismissal: Escape and backdrop click. With `static`, a backdrop click
// is refused (sp:hideprevented) but Escape still closes.

import type { Mixin, SpInstance } from "../define";

export const Modalable: Mixin = {
  props: { static: Boolean },

  init(this: SpInstance) {
    // Route the native cancel (Escape) through hide() so the exit animates.
    this.on(this.el, "cancel", (e) => {
      e.preventDefault();
      this.hide();
    });

    // target === el means the press landed on the backdrop, not the content.
    this.on(this.el, "click", (e) => {
      if (e.target !== this.el) return;
      if (this.config.static) this.emit("hideprevented");
      else this.hide();
    });
  },

  methods: {
    _isMounted(this: SpInstance): boolean {
      return (this.el as HTMLDialogElement).open;
    },
    _mount(this: SpInstance): void {
      (this.el as HTMLDialogElement).showModal();
    },
    _unmount(this: SpInstance): void {
      const dialog = this.el as HTMLDialogElement;
      if (dialog.open) dialog.close();
    },
  },
};
