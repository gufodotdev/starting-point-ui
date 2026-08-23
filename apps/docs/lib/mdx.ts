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
// app root, so it is easy to find from the mdx source. Rendering happens in a
// child process outside the server-component bundle, which turns "use client"
// imports (like lucide-react icons) into stubs the static renderer can't call.
async function renderIncludes(rels: string[]): Promise<Record<string, string>> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const script = path.join(process.cwd(), "scripts", "render-example.mts");
  const { stdout } = await promisify(execFile)("npx", ["tsx", script, ...rels], {
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

async function formatInclude(html: string): Promise<string> {
  const { format } = await import("prettier");

  // React 19 emits image preload hints into static markup; the include is a
  // fragment, so they don't belong.
  const clean = html.replace(/<link rel="preload"[^>]*\/>/g, "");
  return (await format(clean, { parser: "html" })).trim();
}

async function expandIncludes(content: string): Promise<string> {
  const matches = [...content.matchAll(/^%include ([\w./-]+)%$/gm)];
  if (matches.length === 0) return content;

  const rendered = await renderIncludes([...new Set(matches.map((m) => m[1]))]);
  let out = content;
  for (const match of matches) {
    out = out.replace(match[0], await formatInclude(rendered[match[1]]));
  }
  return out;
}

export type ExampleSection = {
  slug: string;
  title: string;
  body: string;
};

// Must match the ids rehype-slug generates, so hub anchors and routes agree.
function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseExampleSections(content: string): ExampleSection[] {
  const headings = [...content.matchAll(/^## (.+)$/gm)];
  return headings.map((match, i) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : content.length;
    const title = match[1].trim();
    return {
      slug: slugifyHeading(title),
      title,
      body: content.slice(start, end).trim(),
    };
  });
}

function titleCaseWords(text: string): string {
  return text.replace(/\S+/g, (word) => word[0].toUpperCase() + word.slice(1));
}

// Prose above the fence is the hub description; prose below it renders only
// on the example's own page.
function splitSectionBody(body: string): { description: string; rest: string; intro: string } {
  const fenceStart = body.search(/^```/m);
  if (fenceStart === -1) return { description: body.trim(), rest: "", intro: "" };
  const fenceEnd = body.indexOf("\n```", fenceStart) + "\n```".length;
  return {
    description: body.slice(0, fenceStart).trim(),
    rest: body.slice(fenceStart, fenceEnd).trim(),
    intro: body.slice(fenceEnd).trim(),
  };
}

function plainText(markdown: string): string {
  return markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/`/g, "");
}

function stripSectionIntros(content: string): string {
  const headings = [...content.matchAll(/^## .+$/gm)];
  if (!headings.length) return content;

  let out = content.slice(0, headings[0].index);
  headings.forEach((match, i) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : content.length;
    const { description, rest } = splitSectionBody(content.slice(start, end));
    out += `${match[0]}\n\n${description}\n\n${rest}\n\n`;
  });
  return out;
}

async function getExampleSectionDoc(slug: string[]): Promise<DocFile | null> {
  const hubPath = path.join(getDocsDirectory(), slug[0], slug[1]) + ".mdx";
  if (!fs.existsSync(hubPath)) return null;

  const { content } = matter(fs.readFileSync(hubPath, "utf-8"));
  const section = parseExampleSections(content).find((s) => s.slug === slug[2]);
  if (!section) return null;

  const { description, rest, intro } = splitSectionBody(section.body);
  const kind = titleCaseWords(slug[1].replace(/s$/, ""));
  const name = titleCaseWords(section.title);
  const fullName = name.toLowerCase().includes(kind.toLowerCase()) ? name : `${name} ${kind}`;

  const parts = intro ? [intro, rest] : [description, rest];
  parts.push(`Browse more [${kind.toLowerCase()} examples](/${slug[0]}/${slug[1]}).`);
  const summary = plainText(description).replace(/\.?\s*$/, ".");

  return {
    metadata: {
      title: section.title,
      seoTitle: `Tailwind CSS ${fullName}`,
      description: `A Tailwind CSS ${fullName.toLowerCase()} with shadcn/ui styling. ${summary} Copy-paste ready.`,
    },
    content: (await expandIncludes(parts.filter(Boolean).join("\n\n"))).replaceAll(
      "%VERSION%",
      version,
    ),
    slug,
  };
}

export async function getDocBySlug(slug: string[]): Promise<DocFile | null> {
  const docsDir = getDocsDirectory();
  const filePath = path.join(docsDir, ...slug) + ".mdx";

  if (!fs.existsSync(filePath)) {
    if (slug.length === 3 && slug[0] === "examples") {
      return getExampleSectionDoc(slug);
    }
    return null;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);
  const source =
    slug.length === 2 && slug[0] === "examples" ? stripSectionIntros(content) : content;

  return {
    metadata: data as DocMetadata,
    content: (await expandIncludes(source)).replaceAll("%VERSION%", version),
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

  const slugs = getMDXFiles(docsDir).map((filePath) =>
    path
      .relative(docsDir, filePath)
      .replace(/\.mdx$/, "")
      .split(path.sep),
  );

  for (const slug of slugs.filter((s) => s.length === 2 && s[0] === "examples")) {
    const raw = fs.readFileSync(path.join(docsDir, ...slug) + ".mdx", "utf-8");
    const { content } = matter(raw);
    for (const section of parseExampleSections(content)) {
      slugs.push([...slug, section.slug]);
    }
  }

  return slugs;
}
