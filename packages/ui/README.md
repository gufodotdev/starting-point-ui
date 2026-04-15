# Starting Point UI

An open-source component library for Tailwind CSS. Inspired by [shadcn/ui](https://ui.shadcn.com), Starting Point UI gives you the same beautiful design system without locking you into a framework. React, Vue, Angular, Django, Laravel, Rails, plain HTML - if it runs Tailwind, it works.

Visit [startingpointui.com](https://www.startingpointui.com) for full documentation, live examples, and an interactive theme editor.

![Starting Point UI](https://raw.githubusercontent.com/gufodotdev/starting-point-ui/main/.github/startingpointui.png)

## Features

- **Framework-agnostic** - works with any web stack. Build with React, Vue, Laravel, plain HTML, or anything else that supports Tailwind
- **Easy to use** - add classes like `btn`, `card`, or `input` and you're done
- **Accessible** - built with WAI-ARIA patterns, keyboard navigation, and focus management
- **Dark mode** - works out of the box with Tailwind's dark mode
- **Themeable** - easy to customize and make your own, follows the same theming principles as shadcn/ui
- **Lightweight** - just CSS and a small JavaScript module for interactive components
- **Clean markup** - readable class names, no class soup

## Components

Beautiful components for building complete interfaces:

Accordion, Avatar, Badge, Breadcrumb, Button, Button Group, Card, Checkbox, Collapsible, Combobox, Dialog, Dropdown, Field, Input, Input Group, Label, Pagination, Popover, Radio Group, Resizable, Select, Separator, Sheet, Sidebar, Slider, Switch, Table, Tabs, Textarea, Tooltip

## Quick Start

Install the package:

```bash
npm install starting-point-ui
```

Add the import to your CSS file:

```css
@import "tailwindcss";
@import "starting-point-ui";
```

Use components in your markup:

```html
<button class="btn btn-primary">Get Started</button>
```

For interactive components (dialogs, dropdowns, tabs, etc.), add the JavaScript:

```html
<script
  src="https://cdn.jsdelivr.net/npm/starting-point-ui@0.15.1"
  type="module"
></script>
```

Or import it in your bundler:

```js
import "starting-point-ui";
```

## Community

- [GitHub Discussions](https://github.com/gufodotdev/starting-point-ui/discussions) - Ask questions or suggest features
- [GitHub Issues](https://github.com/gufodotdev/starting-point-ui/issues) - Report bugs

## License

MIT
