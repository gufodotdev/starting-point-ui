import {
  BookOpen,
  Download,
  Palette,
  SlidersHorizontal,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { SidebarLink } from "@/components/sidebar-link";

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
};

const navigation: { title: string; items: NavItem[] }[] = [
  {
    title: "Guides",
    items: [
      {
        title: "Introduction",
        href: "/docs/guides/introduction",
        icon: BookOpen,
      },
      {
        title: "Installation",
        href: "/docs/guides/installation",
        icon: Download,
      },
      { title: "Theming", href: "/docs/guides/theming", icon: Palette },
      {
        title: "Customization",
        href: "/docs/guides/customization",
        icon: SlidersHorizontal,
      },
      { title: "Help", href: "/docs/guides/help", icon: LifeBuoy },
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
      { title: "Button Group", href: "/docs/components/button-group" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Checkbox", href: "/docs/components/checkbox" },
      { title: "Collapsible", href: "/docs/components/collapsible" },
      { title: "Combobox", href: "/docs/components/combobox" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Dropdown", href: "/docs/components/dropdown" },
      { title: "Field", href: "/docs/components/field" },
      { title: "Forms", href: "/docs/components/forms" },
      { title: "Input", href: "/docs/components/input" },
      { title: "Input Group", href: "/docs/components/input-group" },
      { title: "Label", href: "/docs/components/label" },
      { title: "Pagination", href: "/docs/components/pagination" },
      { title: "Popover", href: "/docs/components/popover" },
      { title: "Radio Group", href: "/docs/components/radio-group" },
      { title: "Select", href: "/docs/components/select" },
      { title: "Separator", href: "/docs/components/separator" },
      { title: "Sheet", href: "/docs/components/sheet" },
      { title: "Sidebar", href: "/docs/components/sidebar" },
      { title: "Slider", href: "/docs/components/slider" },
      { title: "Switch", href: "/docs/components/switch" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Tabs", href: "/docs/components/tabs" },
      { title: "Textarea", href: "/docs/components/textarea" },
      { title: "Toast", href: "/docs/components/toast" },
      { title: "Tooltip", href: "/docs/components/tooltip" },
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
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon ? <item.icon /> : undefined}
                >
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
