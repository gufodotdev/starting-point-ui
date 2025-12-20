import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/CodeBlock";
import { hashCode } from "@/lib/utils";

const components: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-2xl font-semibold tracking-tight mb-3 scroll-mt-20"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-lg font-semibold tracking-tight mt-12 mb-3 scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-base font-semibold tracking-tight mt-8 mb-3 scroll-mt-20"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base/7 leading-relaxed mb-6 text-muted-foreground">
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-primary font-medium underline underline-offset-4"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
  ),
  hr: () => <hr className="my-12 border-dashed" />,
  code: ({ children, ...props }) => {
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
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-dashed">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left font-medium py-3 pr-4 first:w-64">{children}</th>
  ),
  td: ({ children }) => (
    <td className="py-3 pr-4 text-muted-foreground text-sm">{children}</td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
