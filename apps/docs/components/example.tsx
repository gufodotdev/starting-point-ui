"use client";

import { useRef, useState } from "react";
import { Copy, Check, Smartphone, Monitor, Loader2 } from "lucide-react";

type Props = {
  description: string;
  viewSrc: string;
  highlightedCode: string;
};

export function Example({ description, viewSrc, highlightedCode }: Props) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    const text = codeRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="flex rounded border bg-muted p-0.5">
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
          <div className="separator separator-vertical self-center h-4 hidden sm:block"></div>
          <span className="text-xs text-muted-foreground hidden sm:block">{description}</span>
        </div>
        <div className="flex items-center gap-1 -mr-2">
          {view === "preview" && (
            <button
              onClick={() => setIsMobile(!isMobile)}
              className="btn btn-ghost btn-icon-sm hidden xs:flex"
              aria-label={isMobile ? "Desktop view" : "Mobile view"}
            >
              {isMobile ? (
                <Monitor className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`btn btn-ghost btn-icon-sm ${view === "preview" ? "xs:hidden" : ""}`}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`relative flex justify-center ${isMobile ? "bg-muted" : ""} ${view === "preview" ? "" : "hidden"}`}
      >
        <div className="absolute inset-0 flex items-center justify-center" suppressHydrationWarning>
          <Loader2 className="size-6 text-muted-foreground animate-spin" />
        </div>
        <iframe
          suppressHydrationWarning
          src={viewSrc}
          className="bg-background transition-opacity opacity-0 h-120 lg:min-h-[930px] max-h-[930px]"
          style={{
            width: isMobile ? "400px" : "100%",
            maxWidth: "100%",
          }}
          title={description}
        />
      </div>
      <div className={`overflow-auto max-h-120 lg:max-h-[930px] bg-background ${view === "code" ? "" : "hidden"}`}>
        <div
          ref={codeRef}
          className="[&_pre]:p-4 [&_pre]:bg-transparent! [&_.line]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}
