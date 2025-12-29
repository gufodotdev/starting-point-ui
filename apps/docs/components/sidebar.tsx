import { SectionHeading } from "@/components/section-heading";
import { SidebarLink } from "@/components/sidebar-link";

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
      { title: "Avatar", href: "/docs/components/avatar" },
      { title: "Badge", href: "/docs/components/badge" },
      { title: "Breadcrumb", href: "/docs/components/breadcrumb" },
      { title: "Button", href: "/docs/components/button" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Container", href: "/docs/components/container" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Dropdown", href: "/docs/components/dropdown" },
      { title: "Forms", href: "/docs/components/forms" },
      { title: "Pagination", href: "/docs/components/pagination" },
      { title: "Separator", href: "/docs/components/separator" },
      { title: "Sheet", href: "/docs/components/sheet" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Tabs", href: "/docs/components/tabs" },
    ],
  },
  {
    title: "Resources",
    items: [{ title: "Changelog", href: "/docs/resources/changelog" }],
  },
];

export function Sidebar() {
  return (
    <nav className="space-y-6">
      {navigation.map((category) => (
        <div key={category.title}>
          <SectionHeading className="px-3 mb-3">
            {category.title}
          </SectionHeading>
          <div className="flex flex-col gap-0.5">
            {category.items.map((item) => (
              <SidebarLink key={item.href} href={item.href}>
                {item.title}
              </SidebarLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
