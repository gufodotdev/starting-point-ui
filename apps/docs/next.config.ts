import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300,
  serverExternalPackages: ["@tailwindcss/node", "@tailwindcss/oxide", "lightningcss"],
  async headers() {
    return [{ source: "/frame/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  },
  async rewrites() {
    return [{ source: "/:path*.md", destination: "/llms.md/:path*" }];
  },
  async redirects() {
    return [
      { source: "/docs", destination: "/guides/introduction", permanent: true },
      { source: "/docs/:path*", destination: "/:path*", permanent: true },
      { source: "/guides/theming", destination: "/guides/customization", permanent: true },
      { source: "/examples/cards/:path*", destination: "/components/card", permanent: true },
      { source: "/examples/dialogs/:path*", destination: "/components/dialog", permanent: true },
      { source: "/examples/dropdowns/:path*", destination: "/components/dropdown", permanent: true },
      { source: "/examples/tables/:path*", destination: "/components/table", permanent: true },
      { source: "/examples/:path*", destination: "/components", permanent: true },
    ];
  },
};

export default nextConfig;
