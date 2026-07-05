import { AlignLeft } from "lucide-react";
import { TableOfContents } from "@/components/table-of-contents";

export function TocSidebar({
  variant = "wide",
}: {
  variant?: "guide" | "wide";
}) {
  return (
    <aside
      className={`sticky top-(--navbar-height) hidden h-[calc(100svh-var(--navbar-height))] w-54 shrink-0 ${
        variant === "guide" ? "xl:block" : "min-[1800px]:block"
      }`}
    >
      <div className="scrollbar-hover flex h-full flex-col overflow-y-auto pt-10 pb-10 lg:pt-16">
        <div className="flex items-center gap-1.5">
          <AlignLeft className="size-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            On this page
          </p>
        </div>
        <div className="pt-4">
          <TableOfContents />
        </div>
      </div>
    </aside>
  );
}
