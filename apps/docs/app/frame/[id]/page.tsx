import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import {
  getAllPreviewExamples,
  getPreviewExample,
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

  const html = await compilePreviewStyles(example.html);

  return (
    <>
      <div
        data-no-scrollbar-gutter
        data-open={example.open}
        style={framePresets[example.preset]}
        // frame.js sets min-height inline before hydration on direct visits.
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <script dangerouslySetInnerHTML={{ __html: frameScript() }} />
    </>
  );
}
