import { CopyButton } from "@/components/copy-button";
import { PreviewBlock } from "@/components/preview-block";
import { FramePreviewBlock } from "@/components/frame-preview-block";

interface BaseCodeBlockProps {
  children: React.ReactNode;
  code: string;
}

type CodeBlockProps = BaseCodeBlockProps &
  (
    | { header?: null }
    | { header: "label"; label: string }
    | { header: "preview"; title?: string }
    | { header: "frame"; frameHeight?: number; frameAlign?: "right" }
  );

export function CodeBlock(props: CodeBlockProps) {
  const { children, code, header } = props;

  if (header === "preview") {
    return (
      <PreviewBlock code={code} title={props.title}>
        {children}
      </PreviewBlock>
    );
  }

  if (header === "frame") {
    return (
      <FramePreviewBlock
        code={code}
        height={props.frameHeight}
        align={props.frameAlign}
      >
        {children}
      </FramePreviewBlock>
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
    <div className="group relative my-4">
      <Pre>{children}</Pre>
      <CopyButton
        code={code}
        className="absolute top-4 right-4 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
        adjustForScrollbar
      />
    </div>
  );
}

// The shared code look: a muted outer frame (the padded "border area") wrapping
// an inner card panel that holds the highlighted <pre>. Used by the standalone
// code block and the preview block's Code tab so all code renders the same.
//
// `innerRef` and `innerStyle` apply to the inner card, so a caller can clamp it
// to a height and read its scrollHeight. `overlay` renders inside that card
// (e.g. the collapse fade + button), so it stays over the code, never the
// muted frame.
export function Pre({
  children,
  className = "max-h-128 overflow-auto",
  innerRef,
  innerStyle,
  overlay,
  label,
  labelAction,
}: {
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
  innerStyle?: React.CSSProperties;
  overlay?: React.ReactNode;
  label?: React.ReactNode;
  labelAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-muted/60 p-2">
      {/* A filename/label sits in the muted top gutter, above the inner card,
          with an optional action (e.g. copy) centered alongside it. */}
      {label && (
        <div className="flex items-center gap-2 pr-1 pb-2 pl-2 text-sm font-medium text-foreground">
          {label}
          {labelAction && <div className="ml-auto">{labelAction}</div>}
        </div>
      )}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <div ref={innerRef} className="overflow-hidden" style={innerStyle}>
          <pre className={`scrollbar-thin bg-card p-5 ${className}`}>
            {children}
          </pre>
        </div>
        {overlay}
      </div>
    </div>
  );
}
