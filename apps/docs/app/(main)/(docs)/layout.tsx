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
    <div className="sidebar-layout">
      <aside
        className="sidebar bg-background px-2"
        data-sp-toggle="#sidebar-trigger"
      >
        <header className="sidebar-header">
          <Link href="/" className="sidebar-menu-button sidebar-menu-button-lg">
            <span className="brand-logo brand-logo-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6.5 16.5 16.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="17" cy="17" r="2.5" />
              </svg>
            </span>
            <span className="brand-text">
              <span className="brand-name">Starting Point</span>
              <span className="brand-subtitle">v0.24.1</span>
            </span>
          </Link>
        </header>
        <div className="sidebar-content scrollbar-none">
          <Sidebar />
        </div>
      </aside>

      <main className="sidebar-page min-w-0">
        <header className="navbar sticky top-0 z-30 h-(--navbar-height)">
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
