import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/frame/",
    },
    sitemap: "https://startingpointui.com/sitemap.xml",
  };
}
