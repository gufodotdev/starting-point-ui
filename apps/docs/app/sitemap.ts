import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { getAllDocSlugs, getDocsDirectory } from "@/lib/mdx";

// Last commit date of a file, so lastmod means something. Without git (or an
// uncommitted file) the field is left out rather than faked.
function lastCommitDate(file?: string): Date | undefined {
  try {
    const args = ["log", "-1", "--format=%cI", ...(file ? ["--", file] : [])];
    const out = execFileSync("git", args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return out ? new Date(out) : undefined;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://startingpointui.com";
  const docsDir = getDocsDirectory();

  const docUrls = getAllDocSlugs().map((slug) => {
    // Example subpages are sections of their hub file.
    const file = path.join(docsDir, ...slug.slice(0, 2)) + ".mdx";
    return {
      url: `${baseUrl}/${slug.join("/")}`,
      lastModified: lastCommitDate(file),
      changeFrequency: "weekly" as const,
      priority: 1,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: lastCommitDate(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...docUrls,
  ];
}
