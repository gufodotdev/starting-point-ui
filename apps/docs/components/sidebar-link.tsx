"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="sidebar-menu-item">
      <Link
        href={href}
        className={`sidebar-menu-button ${pathname === href ? "active" : ""}`}
      >
        {icon}
        <span>{children}</span>
      </Link>
    </div>
  );
}
