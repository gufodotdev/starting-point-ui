"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/examples";

export function ExampleGallery({ items }: { items: GalleryItem[] }) {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const columnArrays: GalleryItem[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => {
    columnArrays[i % columns].push(item);
  });

  return (
    <div className="flex gap-4">
      {columnArrays.map((colItems, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4">
          {colItems.map((item) => (
            <Link
              key={`${item.type}-${item.category}-${item.variant}`}
              href={`/examples/${item.type}/${item.category}/${item.variant}`}
              className="block overflow-hidden rounded-md bg-muted"
            >
              <div className="m-3 p-1 rounded bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageLight}
                  alt={`${item.category} example ${item.variant}`}
                  className="w-full rounded-md overflow-hidden dark:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageDark}
                  alt={`${item.category} example ${item.variant}`}
                  className="w-full rounded-md overflow-hidden hidden dark:block"
                />
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
