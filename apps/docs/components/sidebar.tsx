"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";

const navigation = [
  {
    title: "Guides",
    items: [
      { title: "Introduction", href: "/docs/guides/introduction" },
      { title: "Installation", href: "/docs/guides/installation" },
      { title: "Help", href: "/docs/guides/help" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/docs/components/button" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Tabs", href: "/docs/components/tabs" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {navigation.map((category) => (
        <div key={category.title}>
          <SectionHeading className="px-3 mb-3">
            {category.title}
          </SectionHeading>
          <div className="flex flex-col gap-0.5">
            {category.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`btn btn-ghost btn-sm justify-start text-[0.8rem] ${
                  pathname === item.href ? "bg-accent" : ""
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
