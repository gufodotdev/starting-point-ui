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
    | { header: "preview"; frameId: string }
  );

export function CodeBlock(props: CodeBlockProps) {
  const { children, code, header } = props;

  if (header === "preview") {
    return (
      <PreviewBlock code={code} frameId={props.frameId}>
        {children}
      </PreviewBlock>
    );
  }

  if (header === "label") {
    return (
      <div className="my-4">
        <Pre
          label={props.label}
          labelAction={<CopyButton code={code} />}
        >
          {children}
        </Pre>
      </div>
    );
  }

  return (
    <div className="relative my-4">
      <Pre>{children}</Pre>
      <CopyButton code={code} className="absolute top-2 z-10" adjustForScrollbar />
    </div>
  );
}

export function Pre({
  children,
  label,
  labelAction,
}: {
  children: React.ReactNode;
  label?: React.ReactNode;
  labelAction?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-code text-sm">
      {label && (
        <div className="flex items-center gap-2 border-b py-2 pr-2 pl-4 font-medium text-foreground">
          {label}
          {labelAction && <div className="ml-auto">{labelAction}</div>}
        </div>
      )}
      <pre className="scrollbar-thin max-h-96 overflow-auto px-4 py-3.5">
        {children}
      </pre>
    </div>
  );
}
