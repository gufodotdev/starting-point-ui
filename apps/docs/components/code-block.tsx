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
      <CopyButton code={code} className="absolute top-2.5 z-10" adjustForScrollbar />
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
    <div className="rounded-xl border bg-code p-1 text-sm">
      {label && (
        <div className="flex items-center gap-2 pt-1 pr-1 pb-1.5 pl-3 font-medium text-foreground">
          {label}
          {labelAction && <div className="ml-auto">{labelAction}</div>}
        </div>
      )}
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <pre className="scrollbar-thin overflow-x-auto px-4 py-3.5">
          {children}
        </pre>
      </div>
    </div>
  );
}
