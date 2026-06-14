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
      <div className="my-4" data-sp-tabs>
        <div className="tab-list" aria-label="Preview and code">
          <button type="button" className="tab active">
            Preview
          </button>
          <button type="button" className="tab">
            Code
          </button>
        </div>

        <div className="tab-panel active mt-2">
          <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-lg border p-4 sm:p-10">
            <div
              className="flex flex-wrap items-center justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          </div>
        </div>

        <div className="tab-panel mt-2">
          <div className="relative overflow-hidden rounded-lg">
            <Pre>{children}</Pre>
            <CopyButton
              code={code}
              className="absolute top-2"
              adjustForScrollbar
            />
          </div>
        </div>
      </div>
    );
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
      <CopyButton code={code} className="absolute top-2" adjustForScrollbar />
    </div>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="scrollbar-thin overflow-auto max-h-128 bg-muted/50 p-4">
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
