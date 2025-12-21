"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  code: string;
  className?: string;
  adjustForScrollbar?: boolean;
}

export function CopyButton({
  code,
  className,
  adjustForScrollbar,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!adjustForScrollbar) return;

    const pre = ref.current?.parentElement?.querySelector("pre");
    if (!pre) return;

    const checkScrollbar = () => {
      setHasScrollbar(pre.scrollHeight > pre.clientHeight);
    };

    checkScrollbar();
    const observer = new ResizeObserver(checkScrollbar);
    observer.observe(pre);

    return () => observer.disconnect();
  }, [adjustForScrollbar]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollbarClass = adjustForScrollbar
    ? hasScrollbar
      ? "right-4"
      : "right-2"
    : "";

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleCopy}
      className={`p-1.5 rounded-md hover:bg-muted transition-colors ${scrollbarClass} ${className ?? ""}`}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <Copy className="size-4 text-foreground" />
      )}
    </button>
  );
}
