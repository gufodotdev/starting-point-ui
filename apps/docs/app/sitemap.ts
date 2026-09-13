import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { getAllDocSlugs, getDocsDirectory } from "@/lib/mdx";

function git(...args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

// A shallow clone only knows the deploy commit, which would date every page
// alike. Then, as without git, lastmod is left out rather than faked.
const hasHistory = git("rev-parse", "--is-shallow-repository") === "false";

function lastCommitDate(file?: string): Date | undefined {
  if (!hasHistory) return undefined;
  const out = git("log", "-1", "--format=%cI", ...(file ? ["--", file] : []));
  return out ? new Date(out) : undefined;
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
