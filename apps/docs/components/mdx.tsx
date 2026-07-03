import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";
import { codeThemeDark, codeThemeLight } from "@/lib/code-theme";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

const prettyCodeOptions = {
  theme: {
    dark: codeThemeDark,
    light: codeThemeLight,
  },
  keepBackground: false,
  transformers: [
    {
      // @ts-expect-error - rehype-pretty-code transformer type
      pre(node) {
        // @ts-expect-error - this context from transformer
        const meta = this.options.meta?.__raw ?? "";

        // @ts-expect-error - this context from transformer
        const source: string = this.source;
        node.properties["data-code"] = source.replace(
          /^\s*<!-- (?:START|END) https:\/\/startingpointui\.com\/\S+ -->\n?/gm,
          "",
        );

        const code = node.children?.[0];
        if (code?.children) {
          code.children = code.children.filter(
            (line: { children?: { children?: { value?: string }[] }[] }) => {
              const text =
                line.children
                  ?.flatMap(
                    (span: { children?: { value?: string }[] }) =>
                      span.children ?? [],
                  )
                  .map((child: { value?: string }) => child.value ?? "")
                  .join("") ?? "";
              return !/^\s*<!-- (?:START|END) https:\/\/startingpointui\.com\/\S+ -->$/.test(
                text,
              );
            },
          );
        }

        if (meta.includes("preview")) {
          node.properties["data-preview"] = "true";
          if (/(?:^|\s)flush(?:\s|$)/.test(meta)) {
            node.properties["data-flush"] = "true";
          }
        }

        const labelMatch = meta.match(/label="([^"]+)"/);
        if (labelMatch) {
          node.properties["data-label"] = labelMatch[1];
        }
      },
    },
  ],
};

const components = {
  Callout,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className="mt-10 lg:mt-12 first:mt-0 scroll-m-28 text-xl font-medium tracking-tight [&+h3]:mt-6! [&+p]:mt-4!"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className="mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4!"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className="mt-8 scroll-m-28 text-base font-medium tracking-tight"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children }: React.ComponentProps<"p">) => (
    <p className="leading-relaxed not-first:mt-6">{children}</p>
  ),
  a: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a className="font-medium underline underline-offset-4" {...props}>
      {children}
    </a>
  ),
  strong: ({ children }: React.ComponentProps<"strong">) => (
    <strong className="font-medium">{children}</strong>
  ),
  blockquote: ({ children }: React.ComponentProps<"blockquote">) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  ),
  ul: ({ children }: React.ComponentProps<"ul">) => (
    <ul className="my-6 ml-6 list-disc">{children}</ul>
  ),
  ol: ({ children }: React.ComponentProps<"ol">) => (
    <ol className="my-6 ml-6 list-decimal">{children}</ol>
  ),
  li: ({ children }: React.ComponentProps<"li">) => (
    <li className="mt-2">{children}</li>
  ),
  hr: () => <hr className="my-4 md:my-8" />,
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
      <code className="relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none">
        {children}
      </code>
    );
  },
  pre: ({
    children,
    "data-code": code = "",
    "data-preview": preview,
    "data-label": label,
    "data-flush": flush,
  }: React.ComponentProps<"pre"> & {
    "data-code"?: string;
    "data-preview"?: string;
    "data-label"?: string;
    "data-flush"?: string;
  }) => {
    if (preview === "true") {
      return (
        <CodeBlock code={code} header="preview" flush={flush === "true"}>
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
    <div className="scrollbar-thin my-6 w-full overflow-y-auto rounded-xl border">
      <table className="relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0">
        {children}
      </table>
    </div>
  ),
  tr: ({ children }: React.ComponentProps<"tr">) => (
    <tr className="m-0 border-b">{children}</tr>
  ),
  th: ({ children }: React.ComponentProps<"th">) => (
    <th className="px-4 py-2 text-left font-bold">{children}</th>
  ),
  td: ({ children }: React.ComponentProps<"td">) => (
    <td className="px-4 py-2 text-left whitespace-nowrap">{children}</td>
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
          rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  );
}
