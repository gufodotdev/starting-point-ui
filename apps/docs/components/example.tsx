"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { screenshotUrl } from "@/lib/examples";
import {
  Copy,
  Check,
  ChevronRight,
  Smartphone,
  Monitor,
  Loader2,
} from "lucide-react";

type Props = {
  breadcrumb: {
    type: string;
    category: string;
    variant: number;
    categoryLabel: string;
  };
  description: string;
  viewSrc: string;
  html: string;
};

export function Example({ breadcrumb, description, viewSrc, html }: Props) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeState, setIframeState] = useState<"idle" | "loaded" | "ready">(
    "idle",
  );
  const codeRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (iframeState !== "loaded") return;
    let viewOrigin: string;
    try {
      viewOrigin = new URL(viewSrc, window.location.href).origin;
    } catch {
      return;
    }
    let ready = false;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== viewOrigin) return;
      const data = e.data;
      if (data?.type === "sp:ready") {
        ready = true;
        setIframeState("ready");
      }
    };
    window.addEventListener("message", onMessage);
    const hello = setInterval(() => {
      if (ready) {
        clearInterval(hello);
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        { type: "sp:hello" },
        viewOrigin,
      );
    }, 100);
    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(hello);
    };
  }, [viewSrc, iframeState]);

  useEffect(() => {
    if (iframeState !== "ready") return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "sp:theme", dark: resolvedTheme === "dark" },
      "*",
    );
  }, [iframeState, resolvedTheme]);

  useEffect(() => {
    if (iframeState !== "ready") return;
    let lastKey = "";
    const send = () => {
      const css = document.getElementById("sp-theme")?.textContent ?? "";
      const bodyFont =
        (document.getElementById("sp-font-body") as HTMLLinkElement | null)
          ?.href ?? "";
      const headingFont =
        (document.getElementById("sp-font-heading") as HTMLLinkElement | null)
          ?.href ?? "";
      const key = `${css} ${bodyFont} ${headingFont}`;
      if (key === lastKey) return;
      lastKey = key;
      iframeRef.current?.contentWindow?.postMessage(
        { type: "sp:editor", css, bodyFont, headingFont },
        "*",
      );
    };
    send();
    const obs = new MutationObserver(send);
    obs.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => obs.disconnect();
  }, [iframeState]);

  const handleCopy = async () => {
    const text = codeRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div data-no-scrollbar-gutter>
      <div className="sticky top-(--navbar-height) z-30 bg-background border-t border-b">
        <div className="px-4 sm:px-6 h-12 flex items-center gap-4">
          <nav className="breadcrumb text-sm">
            <Link href="/examples" className="breadcrumb-item">
              Examples
            </Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight className="size-4" />
            </span>
            <Link
              href={`/examples/${breadcrumb.type}/${breadcrumb.category}`}
              className="breadcrumb-item"
            >
              {breadcrumb.categoryLabel}
            </Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight className="size-4" />
            </span>
            <span className="breadcrumb-item active">{breadcrumb.variant}</span>
          </nav>

          <div className="ml-auto -mr-2 flex items-center gap-2">
            <div className="flex rounded bg-muted p-0.5 mr-2">
              <button
                onClick={() => setView("preview")}
                className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors ${
                  view === "preview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setView("code")}
                className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors ${
                  view === "code"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code
              </button>
            </div>
            <div className="separator separator-vertical self-auto! h-4 hidden md:block" />
            {view === "preview" && (
              <button
                onClick={() => setIsMobile(!isMobile)}
                className="btn btn-ghost btn-sm btn-icon hidden md:flex"
                aria-label={isMobile ? "Desktop view" : "Mobile view"}
              >
                {isMobile ? (
                  <Monitor className="size-4" />
                ) : (
                  <Smartphone className="size-4" />
                )}
              </button>
            )}
            {view === "code" && (
              <button
                onClick={handleCopy}
                className="btn btn-ghost btn-sm btn-icon hidden md:flex"
                aria-label={copied ? "Copied" : "Copy code"}
              >
                {copied ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 bg-muted/50 min-h-[calc(100dvh-var(--navbar-height)-3rem-2px)]">
        <div
          className={`relative flex justify-center ${view === "preview" ? "" : "hidden"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl(breadcrumb, "light")}
            alt={description}
            className="w-full rounded-lg border bg-background md:hidden dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl(breadcrumb, "dark")}
            alt={description}
            className="w-full rounded-lg border bg-background md:hidden hidden dark:block dark:md:hidden"
          />

          <div className="hidden md:contents">
            {iframeState !== "ready" && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                suppressHydrationWarning
              >
                <Loader2 className="size-6 text-muted-foreground animate-spin" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              suppressHydrationWarning
              src={viewSrc}
              onLoad={() => setIframeState("loaded")}
              className={`bg-background rounded-lg border transition-opacity ${iframeState === "ready" ? "opacity-100" : "opacity-0"}`}
              style={{
                boxSizing: "border-box",
                display: "block",
                width: isMobile ? "400px" : "100%",
                maxWidth: isMobile ? "100%" : "1536px",
                height: isMobile
                  ? "667px"
                  : "calc(100dvh - var(--navbar-height) - 3rem - 3rem - 2px)",
              }}
              title={description}
            />
          </div>
        </div>
        <div
          className={`h-[calc(100dvh-var(--navbar-height)-3rem-3rem-2px)] max-w-384 mx-auto overflow-auto scrollbar-thin bg-background rounded-lg border ${view === "code" ? "" : "hidden"}`}
        >
          <div
            ref={codeRef}
            className="[&_pre]:p-4 [&_pre]:bg-transparent! [&_.line]:bg-transparent!"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
