import { TableOfContents } from "@/components/table-of-contents";

export function TocSidebar() {
  return (
    <aside className="sticky top-[calc(var(--navbar-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) shrink-0 flex-col gap-4 overflow-hidden overscroll-none pb-8 min-[1880px]:flex">
      <div className="h-(--top-spacing) shrink-0" />
      <div className="scrollbar-none flex flex-col gap-8 overflow-y-auto px-8">
        <div className="flex flex-col gap-2 pt-4 text-sm">
          <p className="h-6 text-xs font-medium text-muted-foreground">
            On This Page
          </p>
          <TableOfContents />
        </div>
      </div>
    </aside>
  );
}
