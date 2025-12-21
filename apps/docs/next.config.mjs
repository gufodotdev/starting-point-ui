import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { rehypeLucideIcons } from "./lib/rehype-lucide-icons.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: false,
  transformers: [
    {
      pre(node) {
        const meta = this.options.meta?.__raw ?? "";

        // Add raw code as data attribute
        node.properties["data-code"] = this.source;

        // Check for preview flag
        if (meta.includes("preview")) {
          node.properties["data-preview"] = "true";
        }

        // Extract label from meta (e.g. label="filename.tsx")
        const labelMatch = meta.match(/label="([^"]+)"/);
        if (labelMatch) {
          node.properties["data-label"] = labelMatch[1];
        }
      },
    },
  ],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeLucideIcons, [rehypePrettyCode, prettyCodeOptions]],
  },
});

export default withMDX(nextConfig);
