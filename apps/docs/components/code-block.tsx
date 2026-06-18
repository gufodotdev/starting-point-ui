import { CopyButton } from "@/components/copy-button";
import { PreviewBlock } from "@/components/preview-block";

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
    return <PreviewBlock code={code}>{children}</PreviewBlock>;
  }

  if (header === "label") {
    return (
      <div className="my-4 overflow-hidden rounded-lg">
        <Header code={code}>
          <span className="text-sm font-medium">{props.label}</span>
        </Header>
        <Pre>{children}</Pre>
      </div>
    );
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-lg">
      <Pre>{children}</Pre>
      <CopyButton code={code} className="absolute top-1.5" adjustForScrollbar />
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="scrollbar-thin overflow-auto max-h-128 bg-muted p-4">
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
    <div className="flex items-center justify-between border-b bg-muted px-4 py-2 rounded-t-lg">
      {children}
      <div className="-mr-2">
        <CopyButton code={code} />
      </div>
    </div>
  );
}
