"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyContextButtonProps = {
  content: string;
};

export function CopyContextButton({ content }: CopyContextButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-secondary btn-sm text-xs [&>svg]:size-3.5 h-7 px-2.5! hidden sm:inline-flex"
    >
      {copied ? (
        <>
          <Check className="size-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-4" />
          Copy for AI
        </>
      )}
    </button>
  );
}
