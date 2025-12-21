"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import tocbot from "tocbot";

export function TableOfContents() {
  const pathname = usePathname();

  useEffect(() => {
    tocbot.init({
      tocSelector: ".toc",
      contentSelector: "#content",
      headingSelector: "h1, h2, h3",
      headingsOffset: 80,
      scrollSmoothOffset: -80,
      collapseDepth: 6,
      headingObjectCallback: (obj, node) => {
        if (node.tagName === "H1") {
          (obj as { textContent: string }).textContent = "Introduction";
        }
        (obj as { headingLevel: number }).headingLevel = 2;
        return obj;
      },
    });

    return () => tocbot.destroy();
  }, [pathname]);

  return <nav className="toc" aria-label="Table of contents" />;
}
