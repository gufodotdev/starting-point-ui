"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Tablet, Smartphone, Fullscreen, Languages } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { CopyButton } from "@/components/copy-button";

const TABLET_WIDTH = 768;
const MOBILE_WIDTH = 375;

const LANGUAGES = [
  { value: "en", label: "English", dir: "ltr" },
  { value: "ar", label: "Arabic (العربية)", dir: "rtl" },
  { value: "he", label: "Hebrew (עברית)", dir: "rtl" },
];


// The code tab starts at the preview's height; taller code gets a fade and a
// button that expands it in place.
function CodePanel({ children }: { children: React.ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const check = () => setOverflowing(pre.scrollHeight > pre.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(pre);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="rounded-xl border bg-code p-1 text-sm">
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <pre
          ref={preRef}
          className={`scrollbar-thin overflow-x-auto px-4 py-3.5 ${
            expanded ? "" : "max-h-96 overflow-y-hidden"
          }`}
        >
          {children}
        </pre>
        {!expanded && overflowing && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center bg-linear-to-t from-background to-transparent pb-3">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="btn btn-outline btn-sm pointer-events-auto"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FrameExample({
  id,
  frameRef,
}: {
  id: string;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
}) {
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
        className="btn btn-outline btn-sm btn-icon hidden @min-[520px]:inline-flex"
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
  frameDir,
}: {
  children: React.ReactNode;
  code: string;
  frameId: string;
  frameDir?: string;
}) {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const previewId = `preview-${frameId}`;
  const codeId = `code-${frameId}`;

  return (
    <div className="@container my-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex items-center gap-2">
          <div className="btn-group" role="group" aria-label="Preview options">
            {frameDir === "rtl" && (
              <button
                type="button"
                id={`lang-${frameId}`}
                title="Example language"
                aria-label="Example language"
                className="btn btn-outline btn-sm btn-icon"
              >
                <Languages />
              </button>
            )}
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
            <DeviceButtons panelRef={panelRef} />
            <CopyButton code={code} classes="btn btn-outline btn-sm btn-icon" />
          </div>
          {frameDir === "rtl" && (
            <div
              className="dropdown"
              data-sp-toggle={`#lang-${frameId}`}
              data-sp-placement="bottom-end"
            >
              {LANGUAGES.map((language) => (
                <label key={language.value} className="dropdown-item dropdown-item-radio">
                  <input
                    type="radio"
                    name={`lang-${frameId}`}
                    value={language.value}
                    defaultChecked={language.value === "ar"}
                    onChange={() =>
                      frameRef.current?.contentWindow?.postMessage(
                        { type: "sp-language", lang: language.value },
                        "*",
                      )
                    }
                  />
                  {language.label}
                </label>
              ))}
            </div>
          )}
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
              <FrameExample id={frameId} frameRef={frameRef} />
            </Panel>
            <Separator className="relative hidden w-3 bg-transparent p-0 after:absolute after:top-1/2 after:right-0 after:h-8 after:w-1.5 after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 md:block" />
            <Panel defaultSize="0%" minSize="0%" />
          </Group>
        </div>
      </div>

      <div id={codeId} className="tab-content">
        <CodePanel>{children}</CodePanel>
      </div>
    </div>
  );
}
