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

// A line like %plus tables/user-table preset=lg align=top% expands to a whole
// example section from the Plus app: the heading, the description with its
// built-with links, and the preview fence with the rendered markup. The build
// reads .plus, filled by the prebuild fetch so Tailwind scans the markup; in
// dev a missing or changed example is fetched from the api and mirrored there.
const PLUS_URL = process.env.PLUS_URL ?? "http://localhost:8000";

type PlusExample = {
  title: string;
  description: string;
  builtWith: string[];
  related?: string[];
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
  const { title, description, builtWith, related, html } = (await res.json()) as PlusExample;
  const meta = JSON.stringify({ title, description, builtWith, related });
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
  return { title, description, builtWith, related, html };
}

// The same content often exists as a card and as a dialog; each page points
// at the other so a reader who wants the other container finds it.
async function relatedSentence(ids: string[]): Promise<string> {
  const sentences = await Promise.all(
    ids.map(async (id) => {
      const { title } = await readPlusExample(id);
      const kind = id.split("/")[0].replace(/s$/, "");
      return `Prefer a ${kind} instead? See the [${title.toLowerCase()}](/examples/${id}).`;
    }),
  );
  return sentences.join(" ");
}

function builtWithSentence(slugs: string[]): string {
  const links = slugs.map((slug) => `[${slug.replaceAll("-", " ")}](/components/${slug})`);
  const list =
    links.length > 1
      ? `${links.slice(0, -1).join(", ")}${links.length > 2 ? "," : ""} and ${links.at(-1)}`
      : links[0];
  return `Built with the ${list} component${slugs.length > 1 ? "s" : ""}.`;
}

async function plusSection(id: string, options: string): Promise<string> {
  const example = await readPlusExample(id);
  const fence = ["```html preview", options.trim()].filter(Boolean).join(" ");
  const related = example.related?.length ? ` ${await relatedSentence(example.related)}` : "";
  return [
    `## ${example.title}`,
    "",
    `${example.description} ${builtWithSentence(example.builtWith)}${related}`,
    "",
    fence,
    await formatInclude(example.html),
    "```",
  ].join("\n");
}

// Plus directives expand to whole sections, so they run before anything that
// reads the hub's headings: slugs, sibling lists, and the local includes.
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

function splitSectionBody(body: string): { description: string; rest: string } {
  const fenceStart = body.search(/^```/m);
  if (fenceStart === -1) return { description: body.trim(), rest: "" };
  const fenceEnd = body.indexOf("\n```", fenceStart) + "\n```".length;
  return {
    description: body.slice(0, fenceStart).trim(),
    rest: body.slice(fenceStart, fenceEnd).trim(),
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
  const sections = parseExampleSections(await expandPlus(content));
  const section = sections.find((s) => s.slug === slug[2]);
  if (!section) return null;

  const { description, rest } = splitSectionBody(section.body);
  const kind = slug[1].replace(/s$/, "");
  const siblings = sections
    .filter((s) => s.slug !== section.slug)
    .map((s) => `- [${s.title}](/${slug[0]}/${slug[1]}/${s.slug})`);
  const parts = [
    description,
    rest,
    `## More ${kind} examples`,
    [...siblings, `- [All ${kind} examples](/${slug[0]}/${slug[1]})`].join("\n"),
  ];

  return {
    metadata: {
      title: `Tailwind CSS ${section.title}`,
      description: plainText(description),
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
    slug.length === 2 && slug[0] === "examples"
      ? stripSectionIntros(await expandPlus(content))
      : content;

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

export async function getAllDocSlugs(): Promise<string[][]> {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  const slugs = getMDXFiles(docsDir).map((filePath) =>
    path
      .relative(docsDir, filePath)
      .replace(/\.mdx$/, "")
      .split(path.sep));

  for (const slug of slugs.filter((s) => s.length === 2 && s[0] === "examples")) {
    const raw = fs.readFileSync(path.join(docsDir, ...slug) + ".mdx", "utf-8");
    const { content } = matter(raw);
    for (const section of parseExampleSections(await expandPlus(content))) {
      slugs.push([...slug, section.slug]);
    }
  }

  return slugs;
}
