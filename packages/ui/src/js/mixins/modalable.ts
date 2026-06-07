// Mechanism for a native modal <dialog>: showModal() provides the backdrop,
// focus trap, AT-hidden background, and top layer. Element must be a <dialog>.

import type { Mixin, SpInstance } from "../define";

export const Modalable: Mixin = {
  init(this: SpInstance) {
    // Native Escape / light-dismiss would skip our exit animation; route it
    // through hide() instead.
    this.on(this.el, "cancel", (e) => {
      e.preventDefault();
      this.hide();
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
