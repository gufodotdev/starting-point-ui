import fs from "fs";
import path from "path";
import { getAllDocs } from "../lib/mdx";

interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  headings: string[];
}

function stripMdx(content: string): string {
  return (
    content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/^import\s+.*$/gm, "")
      .replace(/^export\s+.*$/gm, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*_]{3,}$/gm, "")
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function extractHeadings(content: string): string[] {
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }

  return headings;
}

async function generateSearchIndex(): Promise<void> {
  const docs = await getAllDocs();

  const searchDocuments: SearchDocument[] = docs.map((doc) => ({
    id: doc.slug.join("/"),
    title: doc.metadata.title,
    description: doc.metadata.description,
    content: stripMdx(doc.content),
    slug: doc.slug.join("/"),
    headings: extractHeadings(doc.content),
  }));

  const outputPath = path.join(process.cwd(), "public", "search-index.json");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(searchDocuments, null, 2));

  console.log(
    `Search index generated with ${searchDocuments.length} documents`,
  );
}

generateSearchIndex();
