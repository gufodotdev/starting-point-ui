"use client";

import { WandSparkles } from "lucide-react";

export function ThemeEditorTrigger() {
  return (
    <button
      type="button"
      className="btn lg:btn-lg"
      onClick={() => {
        const el = document.getElementById("theme-editor");
        if (el) window.sp?.sheet(el)?.show();
      }}
    >
      <WandSparkles className="size-4" />
      Make it yours
    </button>
  );
}
