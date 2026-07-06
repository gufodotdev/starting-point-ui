"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Close the mobile sidebar drawer when the route changes.
export function MobileNavCloser() {
  const pathname = usePathname();

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>(".sidebar");
    if (panel) window.sp?.sidebar(panel)?.hide();
  }, [pathname]);

  return null;
}
