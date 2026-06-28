import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { PageHeaderActions } from "@/components/page-header-actions";
import { TocSidebar } from "@/components/toc-sidebar";
import { MobileNavCloser } from "@/components/mobile-nav-closer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A full-width header sits on top; below it a sidebar layout holds the left
    // nav, the page, and the right table-of-contents. --sidebar-top offsets the
    // fixed panels so they start below the header.
    <div
      className="flex min-h-dvh w-full flex-col overflow-x-clip bg-sidebar"
      style={{ "--sidebar-top": "var(--navbar-height)" } as React.CSSProperties}
    >
      <header className="sticky top-0 z-40 flex h-(--navbar-height) shrink-0 items-center gap-2 bg-background px-4">
        <button
          type="button"
          id="sidebar-trigger"
          className="btn btn-ghost btn-icon-sm sidebar:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-primary text-sm font-bold text-primary-foreground">
            ui
          </span>
          <span className="truncate text-sm font-medium max-sm:hidden">
            Starting Point
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <PageHeaderActions />
        </div>
      </header>

      {/* The nav sidebar is always rendered (so its links are in the SSR HTML
          and the mobile drawer works everywhere). It is authored collapsed, so
          on desktop it is hidden until a docs page expands it (see globals.css
          .app-shell:has(#content)); on mobile the header toggle opens it. */}
      <div className="sidebar app-shell min-h-0 flex-1">
        <div className="sidebar-backdrop" />

        <aside
          className="sidebar-panel collapsed border-r-0! bg-background sidebar:top-(--sidebar-top)! sidebar:h-[calc(100svh-var(--sidebar-top))]!"
          data-collapse="offcanvas"
          data-sp-toggle="#sidebar-trigger"
        >
          <div className="sidebar-content scrollbar-none">
            <Sidebar />
          </div>
        </aside>

        <main className="sidebar-page min-w-0">{children}</main>

        <TocSidebar />
      </div>

      <MobileNavCloser />
    </div>
  );
}
