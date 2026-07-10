import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import {
  getAllPreviewExamples,
  getPreviewExample,
  withShownClass,
} from "@/lib/examples-registry";
import { framePresets } from "@/lib/frame-presets";

const frameScript = readFileSync(
  path.join(process.cwd(), "public", "frame.js"),
  "utf8",
);

export function generateStaticParams() {
  return getAllPreviewExamples().map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export default async function FramePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const example = getPreviewExample(id);
  if (!example) notFound();

  // Author the settled class into the served markup, so init settles the
  // matching overlays open without the enter animation (same path as
  // user-authored .shown markup). The code tab keeps the clean fence source.
  const html = example.open
    ? withShownClass(example.html, example.open)
    : example.html;

  return (
    <>
      <div
        data-no-scrollbar-gutter
        style={framePresets[example.preset]}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <script dangerouslySetInnerHTML={{ __html: frameScript }} />
    </>
  );
}
