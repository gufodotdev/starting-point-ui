import { SidebarLink } from "@/components/sidebar-link";

const navigation = [
  {
    title: "Guides",
    items: [
      { title: "Introduction", href: "/docs/guides/introduction" },
      { title: "Installation", href: "/docs/guides/installation" },
      { title: "Theming", href: "/docs/guides/theming" },
      { title: "Customization", href: "/docs/guides/customization" },
      { title: "Help", href: "/docs/guides/help" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Accordion", href: "/docs/components/accordion" },
      { title: "Avatar", href: "/docs/components/avatar" },
      { title: "Badge", href: "/docs/components/badge" },
      { title: "Breadcrumb", href: "/docs/components/breadcrumb" },
      { title: "Button", href: "/docs/components/button" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Collapsible", href: "/docs/components/collapsible" },
      { title: "Combobox", href: "/docs/components/combobox" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Dropdown", href: "/docs/components/dropdown" },
      { title: "Forms", href: "/docs/components/forms" },
      { title: "Pagination", href: "/docs/components/pagination" },
      { title: "Resizable", href: "/docs/components/resizable" },
      { title: "Separator", href: "/docs/components/separator" },
      { title: "Sheet", href: "/docs/components/sheet" },
      { title: "Sidebar", href: "/docs/components/sidebar" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Tabs", href: "/docs/components/tabs" },
      { title: "Tooltip", href: "/docs/components/tooltip" },
    ],
  },
];

export function Sidebar() {
  return (
    <nav>
      {navigation.map((category) => (
        <div key={category.title} className="menu-group">
          <h4 className="menu-label">{category.title}</h4>
          {category.items.map((item) => (
            <SidebarLink key={item.href} href={item.href}>
              {item.title}
            </SidebarLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
