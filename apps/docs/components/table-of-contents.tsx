"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import tocbot from "tocbot";

export function TableOfContents() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tocbot.init({
      tocSelector: ".toc",
      contentSelector: "#content",
      headingSelector: "#introduction, #content > h2, #content > h3",
      headingsOffset: 80,
      scrollSmoothOffset: -80,
      collapseDepth: 6,
      headingObjectCallback: (obj, node) => {
        if (node.tagName === "H1") {
          (obj as { textContent: string }).textContent = "Introduction";
          (obj as { headingLevel: number }).headingLevel = 2;
        }
        return obj;
      },
    });

    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return () => tocbot.destroy();

    const update = () => {
      const active = container.querySelector<HTMLElement>(".is-active-link");
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.opacity = "1";
      indicator.style.top = `${active.offsetTop}px`;
      indicator.style.height = `${active.offsetHeight}px`;
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      tocbot.destroy();
    };
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative flex">
      <div className="w-0.5 shrink-0 rounded-full bg-border" />
      <div
        ref={indicatorRef}
        className="absolute left-0 w-0.5 rounded-full bg-primary opacity-0 transition-all duration-150 ease-linear"
      />
      <nav className="toc min-w-0 flex-1 pl-3" aria-label="Table of contents" />
    </div>
  );
}
