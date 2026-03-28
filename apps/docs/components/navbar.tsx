import Link from "next/link";
import { Github, Menu, PanelLeftClose } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
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
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-icon-sm"
            >
              <Github />
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
