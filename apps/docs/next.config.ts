import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tailwindcss/node", "@tailwindcss/oxide", "lightningcss"],
  async rewrites() {
    return [{ source: "/:path*.md", destination: "/llms.md/:path*" }];
  },
  async redirects() {
    return [
      { source: "/docs", destination: "/guides/introduction", permanent: true },
      { source: "/docs/:path*", destination: "/:path*", permanent: true },
      { source: "/guides/theming", destination: "/guides/customization", permanent: true },
      { source: "/examples/:type/:category/:variant", destination: "/examples", permanent: true },
    ];
  },
};

export default nextConfig;
