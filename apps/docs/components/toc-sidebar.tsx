import { TableOfContents } from "@/components/table-of-contents";

export function TocSidebar() {
  return (
    <aside
      className="sidebar-panel sidebar-right collapsed border-l-0! bg-background sidebar:top-(--sidebar-top)! sidebar:h-[calc(100svh-var(--sidebar-top))]!"
      data-collapse="offcanvas"
    >
      <div className="sidebar-content scrollbar-hover">
        <div className="sidebar-group">
          <span className="sidebar-group-label mb-1">On This Page</span>
          <div className="sidebar-group-content">
            <TableOfContents />
          </div>
        </div>
      </div>
    </aside>
  );
}
