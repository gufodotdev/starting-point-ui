import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tailwindcss/node", "@tailwindcss/oxide", "lightningcss"],
};

export default nextConfig;
