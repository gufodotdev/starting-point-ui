import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import {
  getAllPreviewExamples,
  getPreviewExample,
  showsOnLoad,
  withShownClass,
} from "@/lib/examples-registry";
import { framePresets } from "@/lib/frame-presets";
import { compilePreviewStyles } from "@/lib/preview-css";

// Read per render, not at module scope, so dev picks up frame.js edits.
const frameScript = () =>
  readFileSync(path.join(process.cwd(), "public", "frame.js"), "utf8");

export async function generateStaticParams() {
  return (await getAllPreviewExamples()).map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export default async function FramePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const example = await getPreviewExample(id);
  if (!example) notFound();

  // Author the settled class into the served markup, so init settles the
  // matching overlays open without the enter animation (same path as
  // user-authored .shown markup). Floating components are positioned by JS,
  // so frame.js opens them via show() on load (data-open) instead. The code
  // tab keeps the clean fence source either way.
  const showOnLoad = example.open && showsOnLoad(example.open);
  const html = await compilePreviewStyles(
    example.open && !showOnLoad
      ? withShownClass(example.html, example.open)
      : example.html,
  );

  return (
    <>
      <div
        data-no-scrollbar-gutter
        data-frame-zoom
        data-open={showOnLoad ? example.open : undefined}
        style={framePresets[example.preset]}
        // frame.js sets min-height inline before hydration on direct visits.
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <script dangerouslySetInnerHTML={{ __html: frameScript() }} />
    </>
  );
}
