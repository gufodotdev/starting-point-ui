"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Monitor, Tablet, Smartphone, Fullscreen } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { CopyButton } from "@/components/copy-button";

const TABLET_WIDTH = 768;
const MOBILE_WIDTH = 375;

function FrameExample({ id }: { id: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const sync = () => {
      frame.contentDocument?.documentElement.classList.toggle(
        "dark",
        resolvedTheme === "dark",
      );
    };

    frame.addEventListener("load", sync);
    if (frame.contentDocument?.readyState === "complete") sync();
    return () => frame.removeEventListener("load", sync);
  }, [id, resolvedTheme]);

  return (
    <iframe
      ref={frameRef}
      src={`/frame/${id}`}
      title="Example preview"
      className="h-96 w-full border-0"
      suppressHydrationWarning
    />
  );
}

function DeviceButtons({
  panelRef,
}: {
  panelRef: React.RefObject<PanelImperativeHandle | null>;
}) {
  const resize = (size: string) => panelRef.current?.resize(size);

  return (
    <>
      <button
        type="button"
        title="Desktop"
        className="btn btn-outline btn-sm btn-icon"
        onClick={() => resize("100%")}
      >
        <Monitor />
      </button>
      <button
        type="button"
        title="Tablet"
        className="btn btn-outline btn-sm btn-icon hidden @min-[768px]:inline-flex"
        onClick={() => resize(`${TABLET_WIDTH}px`)}
      >
        <Tablet />
      </button>
      <button
        type="button"
        title="Mobile"
        className="btn btn-outline btn-sm btn-icon hidden @min-[375px]:inline-flex"
        onClick={() => resize(`${MOBILE_WIDTH}px`)}
      >
        <Smartphone />
      </button>
    </>
  );
}

export function PreviewBlock({
  children,
  code,
  frameId,
}: {
  children: React.ReactNode;
  code: string;
  frameId: string;
}) {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const previewId = `preview-${frameId}`;
  const codeId = `code-${frameId}`;

  return (
    <div className="@container my-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="tab-list h-8 rounded-md">
          <button
            type="button"
            className="tab active px-3"
            data-sp-toggle={`#${previewId}`}
          >
            Preview
          </button>
          <button
            type="button"
            className="tab px-3"
            data-sp-toggle={`#${codeId}`}
          >
            Code
          </button>
        </div>

        <div className="btn-group" role="group" aria-label="Preview options">
          <DeviceButtons panelRef={panelRef} />
          <a
            href={`/frame/${frameId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            aria-label="Open preview in a new tab"
            className="btn btn-outline btn-sm btn-icon"
          >
            <Fullscreen />
          </a>
          <CopyButton code={code} classes="btn btn-outline btn-sm btn-icon" />
        </div>
      </div>

      <div id={previewId} className="tab-content active">
        <div className="relative md:-mr-3">
          <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] md:right-3" />
          <Group orientation="horizontal" className="relative">
            <Panel
              panelRef={panelRef}
              defaultSize="100%"
              minSize={`${MOBILE_WIDTH}px`}
              className="overflow-hidden rounded-xl border bg-background"
            >
              <FrameExample id={frameId} />
            </Panel>
            <Separator className="relative hidden w-3 bg-transparent p-0 after:absolute after:top-1/2 after:right-0 after:h-8 after:w-1.5 after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 md:block" />
            <Panel defaultSize="0%" minSize="0%" />
          </Group>
        </div>
      </div>

      <div id={codeId} className="tab-content">
        <div className="overflow-hidden rounded-xl bg-code text-sm">
          <pre className="scrollbar-thin max-h-96 overflow-auto px-4 py-3.5">
            {children}
          </pre>
        </div>
      </div>
    </div>
  );
}
