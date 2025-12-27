/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/guides/introduction",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/starting-point-ui-analytics/:match*",
        destination: "https://www.startingpointui.com/_vercel/insights/:match*",
      },
    ];
  },
};

export default nextConfig;
