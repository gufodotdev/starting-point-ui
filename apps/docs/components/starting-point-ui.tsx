"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function StartingPointUI() {
  const frame = usePathname().startsWith("/frame/");

  useEffect(() => {
    if (!frame) import("starting-point-ui");
  }, [frame]);

  return null;
}
