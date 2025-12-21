/**
 * Rehype plugin that transforms <icon-name /> syntax into Lucide SVG markup.
 * Only works inside code blocks (for HTML previews in documentation).
 *
 * Usage:
 *   <icon-arrow-right />           - basic icon
 *   <icon-loader-circle class="animate-spin" />  - icon with classes
 *
 * The icon name should be the Lucide icon name in kebab-case.
 * See https://lucide.dev/icons for available icons.
 *
 * Incorrect usage:
 *   <icon-arrow-right></icon-arrow-right>  - must be self-closing
 *   <icon-ArrowRight />                    - must be kebab-case
 */

import { visit } from "unist-util-visit";
import * as icons from "lucide";

// Regex to match <icon-name /> or <icon-name class="..." /> pattern
const iconPattern = /<icon-([a-z0-9-]+)(?:\s+class="([^"]*)")?\s*\/>/g;

// Default SVG attributes for Lucide icons
const defaultAttrs = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

/**
 * Convert kebab-case to PascalCase
 * e.g., "arrow-right" -> "ArrowRight"
 */
function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Convert a Lucide icon to an SVG string
 */
function iconToSvg(iconName, className) {
  const pascalName = toPascalCase(iconName);
  const iconData = icons[pascalName];

  if (!iconData) {
    console.warn(`Unknown icon: ${iconName} (tried ${pascalName})`);
    return null;
  }

  // Build SVG attributes string
  const attrs = className ? { ...defaultAttrs, class: className } : defaultAttrs;
  const svgAttrs = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  // Build child elements (iconData is an array of [tagName, attributes])
  const childElements = iconData
    .map(([childTag, childAttrs]) => {
      const childAttrStr = Object.entries(childAttrs)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case for HTML attributes
          const htmlKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `${htmlKey}="${value}"`;
        })
        .join(" ");
      return `<${childTag} ${childAttrStr}></${childTag}>`;
    })
    .join("");

  return `<svg ${svgAttrs}>${childElements}</svg>`;
}

/**
 * Rehype plugin to replace <icon-name /> with Lucide SVG markup
 */
export function rehypeLucideIcons() {
  return (tree) => {
    visit(tree, "element", (node) => {
      // Only process code elements inside pre tags
      if (node.tagName === "code" && node.children) {
        node.children.forEach((child) => {
          if (child.type === "text" && child.value) {
            child.value = child.value.replace(iconPattern, (match, iconName, className) => {
              const svg = iconToSvg(iconName, className);
              if (svg) {
                return svg;
              }
              return match;
            });
          }
        });
      }
    });
  };
}
