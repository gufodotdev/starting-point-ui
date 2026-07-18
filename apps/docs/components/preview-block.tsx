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

  // Hand the frame keyboard focus while the pointer is inside it, so demos
  // that render open (like the intro dropdown) respond to arrow keys without
  // a click, which would dismiss them. Focusing from the pointer event keeps
  // the focus ring away, and an accidental pass-over is undone on leave;
  // any interaction inside the frame means intent, so focus then stays.
  const previousFocus = useRef<HTMLElement | null>(null);
  const engaged = useRef(false);
  const markEngaged = () => {
    engaged.current = true;
  };

  const handleEnter = () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    const active = document.activeElement;
    // Leave keyboard users and editable controls alone; focus merely left
    // behind by a click (like the nav link that got us here) is fair to take.
    if (
      active instanceof HTMLElement &&
      active !== document.body &&
      active.tagName !== "IFRAME" &&
      (active.matches(":focus-visible") ||
        active.matches("input, textarea, select, [contenteditable]"))
    ) {
      return;
    }
    previousFocus.current = active instanceof HTMLElement ? active : null;
    engaged.current = false;
    frame.contentDocument?.addEventListener("pointerdown", markEngaged);
    frame.contentDocument?.addEventListener("keydown", markEngaged);
    frame.contentWindow.focus();
  };

  const handleLeave = () => {
    const frame = frameRef.current;
    frame?.contentDocument?.removeEventListener("pointerdown", markEngaged);
    frame?.contentDocument?.removeEventListener("keydown", markEngaged);
    if (engaged.current || document.activeElement !== frame) return;
    const previous = previousFocus.current;
    if (previous && previous !== document.body) {
      previous.focus({ preventScroll: true });
    } else {
      frame?.blur();
    }
  };

  return (
    <iframe
      ref={frameRef}
      src={`/frame/${id}`}
      title="Example preview"
      className="h-96 w-full border-0"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
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
