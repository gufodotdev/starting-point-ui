/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/guides/installation",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/starting-point-ui-analytics/insights/:path*",
        destination: "https://www.startingpointui.com/_vercel/insights/:path*",
      },
    ];
  },
};

export default nextConfig;
