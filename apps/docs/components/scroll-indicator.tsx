"use client";

import { useCallback, useEffect, useState } from "react";

const COLUMNS = 4;

export function ScrollIndicator() {
  const [visibilities, setVisibilities] = useState<number[]>(
    Array(COLUMNS).fill(0),
  );

  const update = useCallback(() => {
    const el = document.getElementById("landing-grid");
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const viewWidth = el.clientWidth;
    const contentWidth = el.scrollWidth;
    const colWidth = contentWidth / COLUMNS;

    const vis = Array.from({ length: COLUMNS }, (_, i) => {
      const colStart = i * colWidth;
      const colEnd = colStart + colWidth;
      const visStart = Math.max(colStart, scrollLeft);
      const visEnd = Math.min(colEnd, scrollLeft + viewWidth);
      const visible = Math.max(0, visEnd - visStart);
      return visible / colWidth;
    });

    setVisibilities(vis);
  }, []);

  useEffect(() => {
    const el = document.getElementById("landing-grid");
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollTo = (index: number) => {
    const el = document.getElementById("landing-grid");
    if (!el) return;
    const colWidth = el.scrollWidth / COLUMNS;
    el.scrollTo({ left: index * colWidth, behavior: "smooth" });
  };

  return (
    <div className="flex gap-2 max-xs:justify-center">
      {visibilities.map((vis, i) => (
        <button key={i} onClick={() => scrollTo(i)} className="py-2">
          <div
            className="h-0.5 w-12 rounded-full"
            style={{
              background: `linear-gradient(to right, var(--color-foreground) ${vis * 100}%, var(--color-muted) ${vis * 100}%)`,
            }}
          />
        </button>
      ))}
    </div>
  );
}
