import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { PageHeaderActions } from "@/components/page-header-actions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MobileNavCloser } from "@/components/mobile-nav-closer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sidebar">
      <aside
        className="sidebar-panel bg-background px-2"
        data-sp-toggle="#sidebar-trigger"
      >
        <header className="sidebar-header">
          <Link href="/" className="sidebar-menu-button sidebar-menu-button-lg">
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-primary text-sm font-bold text-primary-foreground">
              ui
            </span>
            <span className="truncate text-sm font-medium">Starting Point</span>
          </Link>
        </header>
        <div className="sidebar-content scrollbar-none">
          <Sidebar />
        </div>
      </aside>

      <main className="sidebar-page min-w-0">
        <header className="sticky top-0 z-30 flex h-(--navbar-height) items-center gap-2 border-b bg-background px-4">
          <button
            type="button"
            id="sidebar-trigger"
            className="btn btn-ghost btn-icon-sm -ml-1 sidebar:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu />
          </button>
          <Breadcrumbs />
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />
            <PageHeaderActions />
          </div>
        </header>
        {children}
      </main>

      <MobileNavCloser />
    </div>
  );
}
