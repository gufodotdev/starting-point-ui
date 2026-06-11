// Non-modal mechanism: top-layer membership via the native Popover API (manual
// mode). Provides the _mount/_unmount/_isMounted seam; _mount also positions.

import type { Mixin, SpInstance } from "../define";

export const Popoverable: Mixin = {
  init(this: SpInstance) {
    (this.el as HTMLElement & { popover: string }).popover = "manual";
  },

  methods: {
    _isMounted(this: SpInstance): boolean {
      return this.el.matches(":popover-open");
    },
    _mount(this: SpInstance): void {
      (this.el as HTMLElement & { showPopover(): void }).showPopover();
      this._position?.();
    },
    _unmount(this: SpInstance): void {
      if (this.el.contains(document.activeElement)) this.trigger?.focus();
      (this.el as HTMLElement & { hidePopover(): void }).hidePopover();
    },
  },
};
