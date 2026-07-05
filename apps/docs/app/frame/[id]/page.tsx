import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import {
  getAllPreviewExamples,
  getPreviewExample,
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

  return (
    <>
      <div
        data-no-scrollbar-gutter
        style={framePresets[example.preset]}
        dangerouslySetInnerHTML={{ __html: example.html }}
      />
      <script dangerouslySetInnerHTML={{ __html: frameScript }} />
    </>
  );
}
