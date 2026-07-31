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
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
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
