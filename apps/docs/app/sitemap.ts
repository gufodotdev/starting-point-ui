import type { MetadataRoute } from "next";
import { getAllDocSlugs } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.startingpointui.com";

  const docSlugs = getAllDocSlugs();
  const docUrls = docSlugs.map((slug) => ({
    url: `${baseUrl}/docs/${slug.join("/")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...docUrls,
  ];
}
