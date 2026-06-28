"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { CopyButton } from "@/components/copy-button";
import { Pre } from "@/components/code-block";

export function PreviewBlock({
  children,
  code,
  title,
}: {
  children: React.ReactNode;
  code: string;
  title?: string;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [expanded, setExpanded] = useState(false);

  // The collapsed code matches the preview's height. Both panels stay in the
  // same grid cell (the inactive one is only faded, never unmounted), so the
  // preview is always laid out and measurable directly — no off-screen copy.
  const previewRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const [previewH, setPreviewH] = useState<number>();
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const ph = previewRef.current?.offsetHeight;
      // scrollHeight is the full code height, even while clamped, so the
      // overflow check stays stable as the preview (and thus the cap) resizes.
      const ch = codeRef.current?.scrollHeight;
      if (ph) setPreviewH(ph);
      if (ph && ch) setOverflows(ch > ph + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (previewRef.current) ro.observe(previewRef.current);
    if (codeRef.current) ro.observe(codeRef.current);
    return () => ro.disconnect();
  }, [code]);

  const collapsed = !expanded && overflows;

  return (
    <div className="my-6 flex flex-col gap-3">
      {/* Header: optional title on the left, copy + view toggle on the right. */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        {title && (
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        )}
        <div className="flex items-center justify-end gap-3 md:ml-auto md:h-9">
          <CopyButton code={code} className="text-muted-foreground" />
          <div
            role="tablist"
            className="flex gap-0 rounded-lg bg-muted/60 ring-1 ring-inset ring-border"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "preview"}
              onClick={() => setView("preview")}
              className={`rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition duration-100 ease-linear ${
                view === "preview"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-inset ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "code"}
              onClick={() => setView("code")}
              className={`rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition duration-100 ease-linear ${
                view === "code"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-inset ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Code
            </button>
          </div>
        </div>
      </div>

      {/* Both panels share one grid cell and both stay in the DOM; the inactive
          one is faded out (it keeps its place, nothing is unmounted) so the
          preview height is always available to size the collapsed code. */}
      {/* The active panel sizes the container (in flow); the inactive one is
          absolutely positioned so it stays in the DOM and laid out (measurable)
          without stretching the height to the taller panel. */}
      <div className="relative min-w-0">
        {/* Preview view: grows to its natural content height. */}
        <div
          ref={previewRef}
          className={`min-w-0 overflow-hidden rounded-2xl border ${
            view === "preview"
              ? ""
              : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
          }`}
        >
          <div className="flex min-h-96 items-center justify-center p-4 sm:p-10">
            <div
              className="flex flex-wrap items-center justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          </div>
        </div>

        {/* Code view: collapsed to the preview's height; "Show more" removes the
            cap so it grows to show all the code. */}
        <div
          className={`min-w-0 ${
            view === "code"
              ? ""
              : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
          }`}
        >
          <Pre
            className={overflows ? "overflow-auto pb-20" : "overflow-auto"}
            innerRef={codeRef}
            innerStyle={collapsed ? { maxHeight: previewH } : undefined}
            overlay={
              overflows && (
                <div
                  className={`absolute inset-x-0 bottom-0 flex h-20 items-center justify-center ${
                    collapsed ? "bg-linear-to-t from-card/90 to-transparent" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setExpanded((e) => !e)}
                  >
                    {collapsed ? "Show more" : "Show less"}
                  </button>
                </div>
              )
            }
          >
            {children}
          </Pre>
        </div>
      </div>
    </div>
  );
}
