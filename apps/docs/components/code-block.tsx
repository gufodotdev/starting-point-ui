import { CopyButton } from "@/components/copy-button";

interface BaseCodeBlockProps {
  children: React.ReactNode;
  code: string;
}

type CodeBlockProps = BaseCodeBlockProps &
  (
    | { header?: null }
    | { header: "label"; label: string }
    | { header: "preview"; id: string }
  );

export function CodeBlock(props: CodeBlockProps) {
  const { children, code, header } = props;

  if (header === "preview") {
    const previewId = `preview-${props.id}`;
    const codeId = `code-${props.id}`;

    return (
      <div className="my-4 rounded-lg border">
        <Header code={code}>
          <div className="tab-list" role="tablist">
            <button
              type="button"
              className="tab active"
              role="tab"
              aria-selected="true"
              data-sp-toggle="tab"
              data-sp-target={`#${previewId}`}
            >
              Preview
            </button>
            <button
              type="button"
              className="tab"
              role="tab"
              aria-selected="false"
              data-sp-toggle="tab"
              data-sp-target={`#${codeId}`}
            >
              Code
            </button>
          </div>
        </Header>

        <div
          id={previewId}
          className="tab-panel active p-4 sm:p-12"
          role="tabpanel"
        >
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            dangerouslySetInnerHTML={{ __html: code }}
          />
        </div>

        <div id={codeId} className="tab-panel" role="tabpanel">
          <Pre>{children}</Pre>
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
    <pre className="overflow-auto max-h-125 bg-muted/50 p-4 text-sm rounded-b-lg">
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
