import { docsNav } from "@/lib/navigation";
import { getDocBySlug } from "@/lib/mdx";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = "https://startingpointui.com";

  const sections = await Promise.all(
    docsNav.map(async (group) => {
      const lines = await Promise.all(
        group.items.map(async (item) => {
          const doc = await getDocBySlug(item.href.slice(1).split("/"));
          const description = doc?.metadata.description;
          return `- [${item.title}](${baseUrl}${item.href})${description ? `: ${description}` : ""}`;
        }),
      );
      return `## ${group.title}\n\n${lines.join("\n")}`;
    }),
  );

  const body = [
    "# Starting Point UI",
    "",
    "> Starting Point UI is a free, open-source Tailwind CSS component library that brings the shadcn/ui design system to any web stack, no React required. Beautiful, accessible components as simple semantic classes, with a small vanilla JavaScript module driving the interactive ones.",
    "",
    sections.join("\n\n"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
