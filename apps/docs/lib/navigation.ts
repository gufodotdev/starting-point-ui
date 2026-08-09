export type NavItem = {
  title: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const discordUrl = "https://discord.gg/ZMc7k8RWe";

export const mainNav: NavItem[] = [
  { title: "Documentation", href: "/guides/introduction" },
  { title: "Examples", href: "/examples" },
];

export const docsNav: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/guides/introduction" },
      { title: "Installation", href: "/guides/installation" },
      { title: "Customization", href: "/guides/customization" },
      { title: "RTL", href: "/guides/rtl" },
      { title: "Inline Events", href: "/guides/inline-events" },
      { title: "Help", href: "/guides/help" },
      { title: "Changelog", href: "/changelog" },
      { title: "Discord", href: discordUrl },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Avatars", href: "/resources/avatars" },
      { title: "Unsplash Editor", href: "/resources/unsplash-editor" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Accordion", href: "/components/accordion" },
      { title: "Alert", href: "/components/alert" },
      { title: "Avatar", href: "/components/avatar" },
      { title: "Badge", href: "/components/badge" },
      { title: "Breadcrumb", href: "/components/breadcrumb" },
      { title: "Button", href: "/components/button" },
      { title: "Button Group", href: "/components/button-group" },
      { title: "Card", href: "/components/card" },
      { title: "Carousel", href: "/components/carousel" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Collapsible", href: "/components/collapsible" },
      { title: "Combobox", href: "/components/combobox" },
      { title: "Command", href: "/components/command" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Drawer", href: "/components/drawer" },
      { title: "Dropdown", href: "/components/dropdown" },
      { title: "Empty", href: "/components/empty" },
      { title: "Field", href: "/components/field" },
      { title: "Forms", href: "/components/forms" },
      { title: "Input", href: "/components/input" },
      { title: "Input Group", href: "/components/input-group" },
      { title: "Item", href: "/components/item" },
      { title: "Kbd", href: "/components/kbd" },
      { title: "Label", href: "/components/label" },
      { title: "Marker", href: "/components/marker" },
      { title: "Pagination", href: "/components/pagination" },
      { title: "Popover", href: "/components/popover" },
      { title: "Progress", href: "/components/progress" },
      { title: "Radio Group", href: "/components/radio-group" },
      { title: "Scroll Fade", href: "/components/scroll-fade" },
      { title: "Scrollbar", href: "/components/scrollbar" },
      { title: "Select", href: "/components/select" },
      { title: "Separator", href: "/components/separator" },
      { title: "Sheet", href: "/components/sheet" },
      { title: "Sidebar", href: "/components/sidebar" },
      { title: "Skeleton", href: "/components/skeleton" },
      { title: "Slider", href: "/components/slider" },
      { title: "Shimmer", href: "/components/shimmer" },
      { title: "Switch", href: "/components/switch" },
      { title: "Table", href: "/components/table" },
      { title: "Tabs", href: "/components/tabs" },
      { title: "Textarea", href: "/components/textarea" },
      { title: "Toast", href: "/components/toast" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Cards", href: "/examples/cards" },
    ],
  },
];
