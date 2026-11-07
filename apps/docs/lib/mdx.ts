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

export function getDocsDirectory() {
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

// A line like %plus tables/user-table preset=lg align=top% expands to an
// example from the Plus app: a preview fence with the title as its heading
// and the rendered markup. The build reads .plus, filled by the prebuild fetch
// so Tailwind scans the markup; in dev a missing or changed example is fetched
// from the api and mirrored there.
const PLUS_URL = process.env.PLUS_URL ?? "http://localhost:8000";

type PlusExample = {
  title: string;
  html: string;
};

async function readPlusExample(id: string): Promise<PlusExample> {
  const dir = path.join(process.cwd(), ".plus");
  const htmlFile = path.join(dir, `${id}.html`);
  const metaFile = path.join(dir, `${id}.json`);
  const mirrored = fs.existsSync(htmlFile) && fs.existsSync(metaFile);
  if (process.env.NODE_ENV === "production" && mirrored) {
    return {
      ...JSON.parse(await fs.promises.readFile(metaFile, "utf-8")),
      html: await fs.promises.readFile(htmlFile, "utf-8"),
    };
  }

  const res = await fetch(`${PLUS_URL}/api/examples/${id}`);
  if (!res.ok) throw new Error(`Plus example ${id} responded ${res.status}`);
  const { title, html } = (await res.json()) as PlusExample;
  const meta = JSON.stringify({ title });
  // The mirror is a Tailwind source, so an unchanged write would trigger a
  // recompile, a re-render, and this function again.
  const same =
    mirrored &&
    (await fs.promises.readFile(htmlFile, "utf-8")) === html &&
    (await fs.promises.readFile(metaFile, "utf-8")) === meta;
  if (!same) {
    await fs.promises.mkdir(path.dirname(htmlFile), { recursive: true });
    await fs.promises.writeFile(htmlFile, html);
    await fs.promises.writeFile(metaFile, meta);
  }
  return { title, html };
}

async function plusSection(id: string, options: string): Promise<string> {
  const example = await readPlusExample(id);
  const fence = ["```html preview", `heading="${example.title}"`, options.trim()].filter(Boolean).join(" ");
  return [fence, await formatInclude(example.html), "```"].join("\n");
}

// Plus directives expand before the local includes.
async function expandPlus(content: string): Promise<string> {
  let out = content;
  for (const match of content.matchAll(/^%plus ([\w-]+\/[\w-]+)([^%\n]*)%$/gm)) {
    const section = await plusSection(match[1], match[2]);
    out = out.replace(match[0], () => section);
  }
  return out;
}

async function expandIncludes(content: string): Promise<string> {
  const expanded = await expandPlus(content);
  const includes = [...expanded.matchAll(/^%include ([\w./-]+)%$/gm)];
  if (includes.length === 0) return expanded;

  const rendered = await renderIncludes([...new Set(includes.map((m) => m[1]))]);
  let out = expanded;
  for (const match of includes) {
    const include = await formatInclude(rendered[match[1]]);
    out = out.replace(match[0], () => include);
  }
  return out;
}

export async function getDocBySlug(slug: string[]): Promise<DocFile | null> {
  const docsDir = getDocsDirectory();
  const filePath = path.join(docsDir, ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;

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

export async function getAllDocSlugs(): Promise<string[][]> {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  return getMDXFiles(docsDir).map((filePath) =>
    path
      .relative(docsDir, filePath)
      .replace(/\.mdx$/, "")
      .split(path.sep));
}
