import Link from "next/link";
import { Menu, PanelLeftClose } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeEditor } from "@/components/theme-editor";
import { Sidebar } from "@/components/sidebar";
import { MobileNavCloser } from "@/components/mobile-nav-closer";
import { SearchDialog } from "@/components/search-dialog";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="px-4 sm:px-6 h-(--navbar-height)">
        <nav className="h-full flex items-center justify-between">
          <div className="flex items-center gap-1 -ml-2 lg:ml-0">
            <button
              type="button"
              className="btn btn-ghost btn-icon-sm lg:hidden"
              aria-label="Open navigation menu"
              data-sp-toggle="dialog"
              data-sp-target="#mobile-nav"
            >
              <Menu />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-1 -mr-2">
            <SearchDialog />
            <div className="mr-1" />
            <Link
              href="/docs/guides/introduction"
              className="btn btn-ghost btn-sm max-lg:hidden"
            >
              Docs
            </Link>
            <Link
              href="/examples"
              className="btn btn-ghost btn-sm max-lg:hidden"
            >
              Examples
            </Link>
            <ThemeEditor />
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-icon-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile navigation */}
      <dialog id="mobile-nav" className="dialog">
        <div className="sheet-backdrop"></div>
        <div className="sheet-panel w-(--sidebar-width) rounded-none overflow-y-auto">
          <div className="sheet-content">
            <div className="menu-group">
              <button
                type="button"
                className="menu-btn w-fit text-muted-foreground"
                aria-label="Close navigation menu"
                data-sp-dismiss="dialog"
              >
                <PanelLeftClose />
              </button>
            </div>
            <Sidebar />
            <div className="menu-group">
              <Link
                href="/examples"
                className="menu-btn"
                data-sp-dismiss="dialog"
              >
                Examples
              </Link>
            </div>
          </div>
        </div>
      </dialog>
      <MobileNavCloser />
    </header>
  );
}
