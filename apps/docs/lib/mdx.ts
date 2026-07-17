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

export function getDocBySlug(slug: string[]): DocFile | null {
  const docsDir = getDocsDirectory();
  const filePath = path.join(docsDir, ...slug) + ".mdx";

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  return {
    metadata: data as DocMetadata,
    content: content.replaceAll("%VERSION%", version),
    slug,
  };
}

export function getAllDocs(): DocFile[] {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  return getMDXFiles(docsDir).map((filePath) => {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(rawContent);
    const relativePath = path.relative(docsDir, filePath);
    const slug = relativePath.replace(/\.mdx$/, "").split(path.sep);

    return { metadata: data as DocMetadata, content, slug };
  });
}

export function getAllDocSlugs(): string[][] {
  return getAllDocs().map((doc) => doc.slug);
}
