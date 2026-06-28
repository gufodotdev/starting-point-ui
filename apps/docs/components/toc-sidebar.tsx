import { AlignLeft } from "lucide-react";
import { TableOfContents } from "@/components/table-of-contents";

// The right-hand table-of-contents sidebar. A real sidebar-right panel so the
// layout reserves its width and centers the article between the two sidebars.
// It is server-rendered (only the tocbot-driven list is client) and authored
// collapsed, so it is hidden until a docs page (#content) expands it on desktop.
export function TocSidebar() {
  return (
    <aside
      className="sidebar-panel sidebar-right collapsed border-l-0! bg-background sidebar:top-(--sidebar-top)! sidebar:h-[calc(100svh-var(--sidebar-top))]!"
      data-collapse="offcanvas"
    >
      <div className="sidebar-content scrollbar-hover pt-4 lg:pt-10">
        <div className="sidebar-group">
          <span className="sidebar-group-label gap-2 px-0">
            <AlignLeft className="size-4" />
            On this page
          </span>
          <div className="sidebar-group-content pt-1">
            <TableOfContents />
          </div>
        </div>
      </div>
    </aside>
  );
}
