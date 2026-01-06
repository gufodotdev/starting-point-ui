"use client";

import { usePathname } from "next/navigation";

export function Header({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 h-(--navbar-height) z-10 ${
        isHome
          ? "bg-[color-mix(in_srgb,var(--muted)_25%,var(--background))]"
          : "border-b bg-background"
      }`}
    >
      {children}
    </header>
  );
}
