"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={`btn btn-ghost btn-sm justify-start text-[0.8rem] ${
        pathname === href ? "bg-accent" : ""
      }`}
    >
      {children}
    </Link>
  );
}
