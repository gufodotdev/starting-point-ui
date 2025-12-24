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
      { title: "Button", href: "/docs/components/button" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Container", href: "/docs/components/container" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Tabs", href: "/docs/components/tabs" },
    ],
  },
  {
    title: "Forms",
    items: [
      { title: "Checkbox", href: "/docs/forms/checkbox" },
      { title: "Input", href: "/docs/forms/input" },
      { title: "Label", href: "/docs/forms/label" },
      { title: "Select", href: "/docs/forms/select" },
      { title: "Textarea", href: "/docs/forms/textarea" },
    ],
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
