import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/code-block";
import { hashCode } from "@/lib/utils";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { rehypeLucideIcons } from "@/lib/rehype-lucide-icons.mjs";

const prettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: false,
  transformers: [
    {
      // @ts-expect-error - rehype-pretty-code transformer type
      pre(node) {
        // @ts-expect-error - this context from transformer
        const meta = this.options.meta?.__raw ?? "";

        // Add raw code as data attribute
        // @ts-expect-error - this context from transformer
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

const components = {
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className="text-lg font-semibold tracking-tight mt-6 sm:mt-12 mb-4 scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className="text-base font-semibold tracking-tight mt-3 sm:mt-6 mb-4 scroll-mt-20"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children }: React.ComponentProps<"p">) => (
    <p className="text-base/7 mb-3 sm:mb-6 text-muted-foreground [figure+&]:mt-3 sm:[figure+&]:mt-6">
      {children}
    </p>
  ),
  a: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a
      className="text-primary font-medium underline underline-offset-4"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: React.ComponentProps<"blockquote">) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  ),
  ul: ({ children }: React.ComponentProps<"ul">) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2 [&_ul]:my-2 [&_ul]:list-[circle] [&_ul]:text-muted-foreground [&_ul]:text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }: React.ComponentProps<"ol">) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
  ),
  hr: () => <hr className="my-6 sm:my-12" />,
  code: ({
    children,
    ...props
  }: React.ComponentProps<"code"> & {
    "data-theme"?: string;
    "data-language"?: string;
  }) => {
    const isCodeBlock = "data-theme" in props || "data-language" in props;
    if (isCodeBlock) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code className="font-mono rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
        {children}
      </code>
    );
  },
  pre: ({
    children,
    "data-code": code = "",
    "data-preview": preview,
    "data-label": label,
  }: React.ComponentProps<"pre"> & {
    "data-code"?: string;
    "data-preview"?: string;
    "data-label"?: string;
  }) => {
    if (preview === "true") {
      return (
        <CodeBlock code={code} header="preview" id={hashCode(code)}>
          {children}
        </CodeBlock>
      );
    }
    if (label) {
      return (
        <CodeBlock code={code} header="label" label={label}>
          {children}
        </CodeBlock>
      );
    }
    return <CodeBlock code={code}>{children}</CodeBlock>;
  },
  table: ({ children }: React.ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">{children}</table>
    </div>
  ),
  thead: ({ children }: React.ComponentProps<"thead">) => (
    <thead className="border-b">{children}</thead>
  ),
  th: ({ children }: React.ComponentProps<"th">) => (
    <th className="text-left font-medium py-3 pr-4 first:w-64">{children}</th>
  ),
  td: ({ children }: React.ComponentProps<"td">) => (
    <td className="py-3 pr-4 text-muted-foreground text-sm">{children}</td>
  ),
};

type CustomMDXProps = Omit<MDXRemoteProps, "components"> & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            rehypeLucideIcons,
            [rehypePrettyCode, prettyCodeOptions],
          ],
        },
      }}
    />
  );
}
