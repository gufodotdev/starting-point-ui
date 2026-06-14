"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileNavCloser() {
  const pathname = usePathname();

  useEffect(() => {
    const sheet = document.querySelector<HTMLDialogElement>("#mobile-nav");
    if (sheet?.open) {
      window.sp?.sheet(sheet)?.hide();
    }
  }, [pathname]);

  return null;
}
