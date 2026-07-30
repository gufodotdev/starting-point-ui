import { getAllDocSlugs, getDocBySlug } from "@/lib/mdx";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) {
    return new Response("Not found", { status: 404 });
  }

  const content = doc.content.replace(/^```(\w+) .*$/gm, "```$1");

  const body = [
    `# ${doc.metadata.title}`,
    "",
    `> ${doc.metadata.description}`,
    "",
    content.trim(),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
