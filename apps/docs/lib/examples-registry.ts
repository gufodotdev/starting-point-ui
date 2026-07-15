import { createHash } from "node:crypto";
import { getAllDocs } from "@/lib/mdx";
import { framePresets } from "@/lib/frame-presets";

export type PreviewExample = {
  id: string;
  html: string;
  preset: string;
  open?: string;
};

export function isPreviewMeta(meta: string): boolean {
  return /(?:^|\s)preview(?:\s|$)/.test(meta);
}

export function presetFromMeta(meta: string): string {
  const preset = meta.match(/preset="?([\w-]+)"?/)?.[1] ?? "default";
  if (!framePresets[preset]) {
    throw new Error(
      `Unknown frame preset "${preset}". Available: ${Object.keys(framePresets).join(", ")}`,
    );
  }
  return preset;
}

// open=<.class> renders the frame with the matching overlays already shown:
// the frame page authors the settled class into the served markup. Only the
// frame is affected; the code tab keeps the clean fence source.
export function openFromMeta(meta: string): string | undefined {
  const open = meta.match(/open="([^"]+)"|open=(\S+)/)?.slice(1).find(Boolean);
  if (open && !/^\.[\w-]+$/.test(open)) {
    throw new Error(`Invalid open selector "${open}". Use a single class, e.g. open=.dialog`);
  }
  return open;
}

// Floating UI components can't be authored open: their position comes from JS.
// The frame page passes these through as data-open and frame.js calls show()
// on load instead of baking .shown into the markup.
const SHOW_ON_LOAD = new Set([".popover", ".dropdown", ".combobox"]);

export function showsOnLoad(open: string): boolean {
  return SHOW_ON_LOAD.has(open);
}

// Adds the settled "shown" class to every element carrying the given class.
export function withShownClass(html: string, open: string): string {
  const cls = open.slice(1);
  return html.replace(/class="([^"]*)"/g, (match, value: string) =>
    value.split(/\s+/).includes(cls) ? `class="${value} shown"` : match,
  );
}

export function exampleId(source: string, preset: string, open?: string): string {
  return createHash("sha1")
    .update(`${preset}\n${open ?? ""}\n${source.trim()}`)
    .digest("hex")
    .slice(0, 12);
}

// Pulls every ```html preview fence out of the docs so each can be pre-rendered
// as its own static /frame/[id] page.
const FENCE = /```html\s+([^\n]*)\n([\s\S]*?)```/g;

let cache: Map<string, PreviewExample> | undefined;

function collect(): Map<string, PreviewExample> {
  if (cache) return cache;

  const examples = new Map<string, PreviewExample>();
  for (const doc of getAllDocs()) {
    for (const match of doc.content.matchAll(FENCE)) {
      const meta = match[1] ?? "";
      if (!isPreviewMeta(meta)) continue;
      const html = match[2].trimEnd();
      const preset = presetFromMeta(meta);
      const open = openFromMeta(meta);
      const id = exampleId(html, preset, open);
      if (!examples.has(id)) examples.set(id, { id, html, preset, open });
    }
  }

  if (process.env.NODE_ENV === "production") cache = examples;
  return examples;
}

export function getAllPreviewExamples(): PreviewExample[] {
  return [...collect().values()];
}

export function getPreviewExample(id: string): PreviewExample | undefined {
  return collect().get(id);
}
