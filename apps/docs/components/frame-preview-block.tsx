"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";

// Previews an example in an iframe, for layouts that need their own viewport
// (the fixed-position sidebar). The iframe loads /frame for its CSS and runtime,
// then we inject the example's markup; the code stays in the markdown fence.
export function FramePreviewBlock({
  children,
  code,
  height = 480,
  align = "left",
}: {
  children: React.ReactNode;
  code: string;
  height?: number;
  align?: "left" | "right";
}) {
  const [expanded, setExpanded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const inject = () => {
      const doc = frame.contentDocument;
      const root = doc?.getElementById("frame-root");
      if (!doc || !root) return;
      doc.documentElement.classList.toggle(
        "dark",
        document.documentElement.classList.contains("dark"),
      );
      // Defer past the frame's own hydration so React doesn't wipe the markup.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.innerHTML = code;
        });
      });
    };

    frame.addEventListener("load", inject);
    if (frame.contentDocument?.readyState === "complete") inject();
    return () => frame.removeEventListener("load", inject);
  }, [code]);

  return (
    <div className="my-4 flex flex-col overflow-hidden rounded-lg border">
      {/* A fixed wide iframe clipped to the column, so it renders in desktop
          mode at real size. align="right" clips to the right edge. */}
      <div className="relative overflow-hidden" style={{ height }}>
        <iframe
          ref={frameRef}
          src="/frame"
          title="Example preview"
          className={`absolute top-0 h-full w-400 max-w-none border-0 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        />
      </div>

      <div className="relative border-t">
        {expanded && (
          <CopyButton code={code} className="absolute top-1.5 right-1.5 z-20" />
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
