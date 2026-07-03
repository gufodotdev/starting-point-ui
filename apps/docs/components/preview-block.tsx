"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

export function PreviewBlock({
  children,
  code,
  flush = false,
}: {
  children: React.ReactNode;
  code: string;
  flush?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const collapsible = code.trimEnd().split("\n").length > 4;
  const showCollapsed = collapsible && !expanded;

  return (
    <div className="group relative my-6 flex flex-col overflow-hidden rounded-xl border">
      {flush ? (
        <div
          className="relative h-130 transform-gpu overflow-hidden [&_.sidebar-panel]:h-full! [&_.sidebar]:h-full [&_.sidebar]:min-h-full"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      ) : (
        <div className="flex min-h-96 w-full items-center justify-center p-10">
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            dangerouslySetInnerHTML={{ __html: code }}
          />
        </div>
      )}

      <div className="relative border-t bg-code text-sm">
        <pre
          className={`scrollbar-thin px-4 py-3.5 ${
            showCollapsed
              ? "max-h-27 overflow-hidden select-none"
              : "max-h-96 overflow-auto"
          }`}
        >
          {children}
        </pre>
        {!showCollapsed && (
          <CopyButton
            code={code}
            className="absolute top-3 right-3 z-20 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          />
        )}
        {showCollapsed && (
          <div className="absolute inset-0 flex items-center justify-center pb-4">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, var(--code), color-mix(in oklab, var(--code) 60%, transparent), transparent)",
              }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm relative z-10 rounded-lg bg-background shadow-none hover:bg-muted"
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
