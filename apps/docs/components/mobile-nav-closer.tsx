"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileNavCloser() {
  const pathname = usePathname();

  useEffect(() => {
    const dialog = document.querySelector<HTMLDialogElement>("#mobile-nav");
    if (dialog?.open) {
      window.sp?.dialog.close(dialog);
    }
  }, [pathname]);

  return null;
}
