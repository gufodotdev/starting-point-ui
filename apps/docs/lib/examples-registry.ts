import { createHash } from "node:crypto";
import { getAllDocs } from "@/lib/mdx";
import { framePresets } from "@/lib/frame-presets";

export type PreviewExample = {
  id: string;
  html: string;
  preset: string;
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

export function exampleId(source: string, preset: string): string {
  return createHash("sha1")
    .update(`${preset}\n${source.trim()}`)
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
      const id = exampleId(html, preset);
      if (!examples.has(id)) examples.set(id, { id, html, preset });
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
