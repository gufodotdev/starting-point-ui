import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/view/",
    },
    sitemap: "https://www.startingpointui.com/sitemap.xml",
  };
}
