import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string({ error: "Frontmatter 'title' is required" }),
  description: z.string({ error: "Frontmatter 'description' is required" }),
});

export type DocMetadata = z.infer<typeof frontmatterSchema>;

type DocFile = {
  metadata: DocMetadata;
  content: string;
  slug: string[];
};

function parseFrontmatter(
  fileContent: string,
  filePath: string
): {
  metadata: DocMetadata;
  content: string;
} {
  const { data, content } = matter(fileContent);

  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid frontmatter in ${filePath}:\n${errors}`);
  }

  return { metadata: result.data, content };
}

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
  const { metadata, content } = parseFrontmatter(rawContent, filePath);

  return {
    metadata,
    content,
    slug,
  };
}

export function getAllDocs(): DocFile[] {
  const docsDir = getDocsDirectory();

  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const mdxFiles = getMDXFiles(docsDir);

  return mdxFiles.map((filePath) => {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { metadata, content } = parseFrontmatter(rawContent, filePath);

    // Get relative path and convert to slug array
    const relativePath = path.relative(docsDir, filePath);
    const slug = relativePath.replace(/\.mdx$/, "").split(path.sep);

    return {
      metadata,
      content,
      slug,
    };
  });
}

export function getAllDocSlugs(): string[][] {
  return getAllDocs().map((doc) => doc.slug);
}
