import { SidebarLink } from "@/components/sidebar-link";

type NavItem = {
  title: string;
  href: string;
};

const navigation: { title: string; items: NavItem[] }[] = [
  {
    title: "Guides",
    items: [
      { title: "Introduction", href: "/guides/introduction" },
      { title: "Installation", href: "/guides/installation" },
      { title: "Theming", href: "/guides/theming" },
      { title: "Customization", href: "/guides/customization" },
      { title: "Help", href: "/guides/help" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Accordion", href: "/components/accordion" },
      { title: "Avatar", href: "/components/avatar" },
      { title: "Badge", href: "/components/badge" },
      { title: "Brand", href: "/components/brand" },
      { title: "Breadcrumb", href: "/components/breadcrumb" },
      { title: "Button", href: "/components/button" },
      { title: "Button Group", href: "/components/button-group" },
      { title: "Card", href: "/components/card" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Collapsible", href: "/components/collapsible" },
      { title: "Combobox", href: "/components/combobox" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Dropdown", href: "/components/dropdown" },
      { title: "Field", href: "/components/field" },
      { title: "Forms", href: "/components/forms" },
      { title: "Input", href: "/components/input" },
      { title: "Input Group", href: "/components/input-group" },
      { title: "Label", href: "/components/label" },
      { title: "Navbar", href: "/components/navbar" },
      { title: "Pagination", href: "/components/pagination" },
      { title: "Popover", href: "/components/popover" },
      { title: "Radio Group", href: "/components/radio-group" },
      { title: "Scrollbar", href: "/components/scrollbar" },
      { title: "Select", href: "/components/select" },
      { title: "Separator", href: "/components/separator" },
      { title: "Sheet", href: "/components/sheet" },
      { title: "Sidebar", href: "/components/sidebar" },
      { title: "Slider", href: "/components/slider" },
      { title: "Switch", href: "/components/switch" },
      { title: "Table", href: "/components/table" },
      { title: "Tabs", href: "/components/tabs" },
      { title: "Textarea", href: "/components/textarea" },
      { title: "Toast", href: "/components/toast" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
];

export function Sidebar() {
  return (
    <>
      {navigation.map((category) => (
        <div key={category.title} className="sidebar-group">
          <span className="sidebar-group-label">{category.title}</span>
          <div className="sidebar-group-content">
            <nav className="sidebar-menu">
              {category.items.map((item) => (
                <SidebarLink key={item.href} href={item.href}>
                  {item.title}
                </SidebarLink>
              ))}
            </nav>
          </div>
        </div>
      ))}
    </>
  );
}
