"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

export function PreviewBlock({
  children,
  code,
}: {
  children: React.ReactNode;
  code: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-4 flex flex-col overflow-hidden rounded-lg border">
      <div className="flex min-h-72 items-center justify-center p-4 sm:p-10">
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      </div>

      <div className="relative border-t">
        {expanded && (
          <CopyButton
            code={code}
            className="absolute top-1.5 right-1.5 z-20"
          />
        )}
        <pre
          className={`scrollbar-thin bg-muted p-4 ${
            expanded ? "overflow-auto max-h-128" : "overflow-hidden max-h-28"
          }`}
        >
          {children}
        </pre>
        {!expanded && (
          <div className="absolute inset-0 flex items-end justify-center pb-6">
            <div className="absolute inset-0 bg-linear-to-t from-muted via-muted/70 to-muted/20" />
            <button
              type="button"
              className="btn btn-secondary btn-sm relative z-10"
              onClick={() => setExpanded(true)}
            >
              View Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
