import { createHash } from "node:crypto";
import { getAllDocs } from "@/lib/mdx";
import { framePresets } from "@/lib/frame-presets";

export type PreviewExample = {
  id: string;
  html: string;
  preset: string;
  open?: string;
  dir?: "rtl";
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

// dir=rtl renders the frame in right-to-left mode to demo mirrored layouts.
export function dirFromMeta(meta: string): "rtl" | undefined {
  return /(?:^|\s)dir=rtl(?:\s|$)/.test(meta) ? "rtl" : undefined;
}

// open=<.class> makes the frame open the matching overlays on load.
export function openFromMeta(meta: string): string | undefined {
  const open = meta.match(/open="([^"]+)"|open=(\S+)/)?.slice(1).find(Boolean);
  if (open && !/^\.[\w-]+(:first)?$/.test(open)) {
    throw new Error(`Invalid open selector "${open}". Use a single class, e.g. open=.dialog`);
  }
  return open;
}

export function exampleId(
  source: string,
  preset: string,
  open?: string,
  dir?: string,
): string {
  return createHash("sha1")
    .update(`${preset}\n${open ?? ""}\n${dir ?? ""}\n${source.trim()}`)
    .digest("hex")
    .slice(0, 12);
}

// Pulls every ```html preview fence out of the docs so each can be pre-rendered
// as its own static /frame/[id] page.
const FENCE = /```html\s+([^\n]*)\n([\s\S]*?)```/g;

let cache: Promise<Map<string, PreviewExample>> | undefined;

function collect(): Promise<Map<string, PreviewExample>> {
  if (cache) return cache;

  const result = build();
  if (process.env.NODE_ENV === "production") cache = result;
  return result;
}

async function build(): Promise<Map<string, PreviewExample>> {
  const examples = new Map<string, PreviewExample>();
  for (const doc of await getAllDocs()) {
    for (const match of doc.content.matchAll(FENCE)) {
      const meta = match[1] ?? "";
      if (!isPreviewMeta(meta)) continue;
      const html = match[2].trimEnd();
      const preset = presetFromMeta(meta);
      const open = openFromMeta(meta);
      const dir = dirFromMeta(meta);
      const id = exampleId(html, preset, open, dir);
      if (!examples.has(id)) examples.set(id, { id, html, preset, open, dir });
    }
  }

  return examples;
}

export async function getAllPreviewExamples(): Promise<PreviewExample[]> {
  return [...(await collect()).values()];
}

export async function getPreviewExample(
  id: string,
): Promise<PreviewExample | undefined> {
  return (await collect()).get(id);
}
