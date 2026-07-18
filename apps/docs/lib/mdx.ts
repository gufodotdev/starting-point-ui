import fs from "fs";
import { version } from "@/lib/version";
import path from "path";
import matter from "gray-matter";

export type DocMetadata = {
  title: string;
  seoTitle?: string;
  description: string;
};

type DocFile = {
  metadata: DocMetadata;
  content: string;
  slug: string[];
};

function getDocsDirectory() {
  return path.join(process.cwd(), "content", "docs");
}

function getMDXFiles(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

// A line like %include examples/cards/music-queue.tsx% renders the example
// component to formatted html before mdx compilation, so preview frames, code
// tabs, and copy buttons all see the real markup. The path is relative to the
// app root, so it is easy to find from the mdx source.
async function renderInclude(rel: string): Promise<string> {
  const mod = await import(`../examples/${rel.replace(/^examples\//, "")}`);
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { format } = await import("prettier");

  // React 19 emits image preload hints into static markup; the include is a
  // fragment, so they don't belong.
  const html = renderToStaticMarkup(createElement(mod.default)).replace(
    /<link rel="preload"[^>]*\/>/g,
    "",
  );
  return (await format(html, { parser: "html" })).trim();
}

async function expandIncludes(content: string): Promise<string> {
  const matches = [...content.matchAll(/^%include ([\w./-]+)%$/gm)];
  let out = content;
  for (const match of matches) {
    out = out.replace(match[0], await renderInclude(match[1]));
  }
  return out;
}

export async function getDocBySlug(slug: string[]): Promise<DocFile | null> {
  const docsDir = getDocsDirectory();
  const filePath = path.join(docsDir, ...slug) + ".mdx";

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  return {
    metadata: data as DocMetadata,
    content: (await expandIncludes(content)).replaceAll("%VERSION%", version),
    slug,
  };
}

export async function getAllDocs(): Promise<DocFile[]> {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  return Promise.all(
    getMDXFiles(docsDir).map(async (filePath) => {
      const rawContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(rawContent);
      const relativePath = path.relative(docsDir, filePath);
      const slug = relativePath.replace(/\.mdx$/, "").split(path.sep);

      return {
        metadata: data as DocMetadata,
        content: await expandIncludes(content),
        slug,
      };
    }),
  );
}

export function getAllDocSlugs(): string[][] {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  return getMDXFiles(docsDir).map((filePath) =>
    path
      .relative(docsDir, filePath)
      .replace(/\.mdx$/, "")
      .split(path.sep),
  );
}
