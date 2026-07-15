"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/lib/navigation";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-[calc(var(--navbar-height)+0.6rem)] z-30 hidden h-[calc(100svh-var(--navbar-height)-0.6rem)] w-(--sidebar-width) shrink-0 flex-col overflow-hidden overscroll-none xl:flex">
      <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pb-12 pl-2">
        {docsNav.map((group, index) => (
          <div
            key={group.title}
            className={`flex w-full min-w-0 flex-col p-2 ${
              index === 0 ? "pt-6" : ""
            }`}
          >
            <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground">
              {group.title}
            </div>
            <nav className="flex w-full min-w-0 flex-col gap-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={pathname === item.href}
                  className="flex h-7.5 w-fit items-center gap-2 rounded-md border border-transparent px-2 text-[0.8rem] font-medium hover:bg-accent hover:text-accent-foreground data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
