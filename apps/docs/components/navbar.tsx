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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.634 22.412c.575.105.785-.25.785-.553 0-.275-.01-1.002-.016-1.968-3.2.695-3.876-1.543-3.876-1.543-.523-1.33-1.278-1.685-1.278-1.685-1.044-.714.08-.699.08-.699 1.156.081 1.764 1.187 1.764 1.187 1.026 1.757 2.692 1.25 3.35.956.104-.744.402-1.25.73-1.538-2.555-.29-5.242-1.278-5.242-5.687 0-1.257.45-2.285 1.186-3.09-.12-.291-.514-1.463.113-3.05 0 0 .966-.31 3.165 1.18a10.98 10.98 0 0 1 2.88-.387c.977.005 1.962.132 2.88.388 2.197-1.49 3.162-1.18 3.162-1.18.629 1.586.234 2.758.115 3.049.739.805 1.185 1.833 1.185 3.09 0 4.42-2.692 5.394-5.256 5.677.413.356.78 1.058.78 2.133 0 1.54-.014 2.782-.014 3.16 0 .307.208.665.792.552A11.502 11.502 0 0 0 12 .5Z"/></svg>
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
