"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  code: string;
  className?: string;
  classes?: string;
  adjustForScrollbar?: boolean;
}

export function CopyButton({
  code,
  className,
  classes = "btn btn-ghost btn-sm btn-icon",
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
      ? "right-3"
      : "right-2"
    : "";

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleCopy}
      className={`${classes} cursor-pointer ${scrollbarClass} ${className ?? ""}`}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="text-green-600" /> : <Copy />}
    </button>
  );
}
