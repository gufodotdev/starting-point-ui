export type NavItem = {
  title: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Docs", href: "/guides/introduction" },
  { title: "Components", href: "/components" },
  { title: "Examples", href: "/examples" },
];

export const docsNav: NavGroup[] = [
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
      { title: "Kbd", href: "/components/kbd" },
      { title: "Label", href: "/components/label" },
      { title: "Pagination", href: "/components/pagination" },
      { title: "Popover", href: "/components/popover" },
      { title: "Progress", href: "/components/progress" },
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
