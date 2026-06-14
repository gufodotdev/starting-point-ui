import { CopyButton } from "@/components/copy-button";

interface BaseCodeBlockProps {
  children: React.ReactNode;
  code: string;
}

type CodeBlockProps = BaseCodeBlockProps &
  (
    | { header?: null }
    | { header: "label"; label: string }
    | { header: "preview" }
  );

export function CodeBlock(props: CodeBlockProps) {
  const { children, code, header } = props;

  if (header === "preview") {
    return (
      <div className="my-4 overflow-hidden rounded-lg border">
        <div className="p-4">
          <div
            className="flex flex-wrap gap-4"
            dangerouslySetInnerHTML={{ __html: code }}
          />
        </div>

        <div className="relative border-t">
          <Pre>{children}</Pre>
          <CopyButton code={code} className="absolute top-2" adjustForScrollbar />
        </div>
      </div>
    );
  }

  if (header === "label") {
    return (
      <div className="my-4 overflow-hidden rounded-lg border">
        <Header code={code}>
          <span className="text-sm font-medium">{props.label}</span>
        </Header>
        <Pre>{children}</Pre>
      </div>
    );
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border">
      <Pre>{children}</Pre>
      <CopyButton code={code} className="absolute top-2" adjustForScrollbar />
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="scrollbar-thin overflow-auto max-h-80 bg-muted/25 p-4 rounded-b-lg">
      {children}
    </pre>
  );
}

function Header({
  children,
  code,
}: {
  children: React.ReactNode;
  code: string;
}) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2 rounded-t-lg">
      {children}
      <div className="-mr-2">
        <CopyButton code={code} />
      </div>
    </div>
  );
}
