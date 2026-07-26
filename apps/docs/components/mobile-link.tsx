"use client";

import Link from "next/link";

export function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-2xl font-medium"
      onClick={() => {
        const menu = document.getElementById("mobile-nav");
        if (menu) window.sp?.popover(menu)?.hide();
      }}
    >
      {children}
    </Link>
  );
}
