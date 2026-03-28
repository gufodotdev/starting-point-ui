"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Smartphone, Monitor, Copy, Check } from "lucide-react";

type Props = {
  type: string;
  category: string;
  categoryLabel: string;
  variant: string;
  viewSrc: string;
  code: string;
  highlightedCode: string;
  previewImageLight?: string;
  previewImageDark?: string;
};

export function Example({
  type,
  category,
  categoryLabel,
  variant,
  viewSrc,
  code,
  highlightedCode,
  previewImageLight,
  previewImageDark,
}: Props) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100dvh-var(--navbar-height)-1px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-y border-dashed bg-background">
        <div className="mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/examples" className="breadcrumb-link">
              Examples
            </Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight className="size-4" />
            </span>
            <Link
              href={`/examples/${type}/${category}`}
              className="breadcrumb-link"
            >
              {categoryLabel}
            </Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight className="size-4" />
            </span>
            <span className="breadcrumb-page" aria-current="page">
              {variant}
            </span>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <div className="flex rounded border bg-muted p-0.5">
              <button
                onClick={() => setView("preview")}
                className={`px-1.5 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
                  view === "preview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setView("code")}
                className={`px-1.5 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
                  view === "code"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code
              </button>
            </div>

            <div className="hidden md:block w-px h-5 bg-border mx-2" />
            {view === "preview" ? (
              <button
                onClick={() => setIsMobile(!isMobile)}
                className="hidden md:flex btn btn-ghost btn-icon-sm -mr-2"
                aria-label={isMobile ? "Desktop view" : "Mobile view"}
              >
                {isMobile ? (
                  <Monitor className="size-4" />
                ) : (
                  <Smartphone className="size-4" />
                )}
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="hidden md:flex btn btn-ghost btn-icon-sm -mr-2"
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

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted relative">
        {/* Preview */}
        <div
          className={`flex justify-center p-4 sm:p-6 md:h-full ${view === "preview" ? "" : "hidden"}`}
        >
          {/* Mobile: show image */}
          {previewImageLight && previewImageDark && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageLight}
                alt={`${categoryLabel} ${variant} preview`}
                className="w-full h-auto max-w-lg object-contain rounded-lg border bg-background md:hidden dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageDark}
                alt={`${categoryLabel} ${variant} preview`}
                className="w-full h-auto max-w-lg object-contain rounded-lg border bg-background hidden dark:block md:hidden md:dark:hidden"
              />
            </>
          )}
          {/* Desktop: show iframe */}
          <iframe
            src={viewSrc}
            className="hidden md:block w-full bg-background border rounded-lg"
            style={{
              maxHeight: "930px",
              height: "100%",
              maxWidth: isMobile ? "400px" : "1536px",
            }}
            title="Preview"
          />
        </div>

        {/* Code */}
        <div
          className={`flex justify-center p-6 h-full ${view === "code" ? "" : "hidden"}`}
        >
          <div className="w-full max-w-384 max-h-[930px] h-full border rounded-lg bg-background overflow-auto">
            <div
              className="[&_pre]:p-4 [&_pre]:bg-transparent! [&_.line]:bg-transparent!"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
