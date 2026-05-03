import Link from "next/link";
import { Menu, PanelLeftClose } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeEditor } from "@/components/theme-editor";
import { Sidebar } from "@/components/sidebar";
import { MobileNavCloser } from "@/components/mobile-nav-closer";
import { SearchDialog } from "@/components/search-dialog";
import {
  formatCount,
  getGithubStars,
  getNpmDownloads,
} from "@/lib/stats";

export async function Navbar() {
  const [stars, downloads] = await Promise.all([
    getGithubStars(),
    getNpmDownloads(),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="px-4 sm:px-6 h-(--navbar-height)">
        <nav className="h-full flex items-center justify-between">
          <div className="flex items-center gap-2 -ml-2 lg:ml-0">
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
          <div className="flex items-center gap-2 -mr-2">
            <SearchDialog />
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
            <div className="separator separator-vertical self-auto! h-4" />
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="btn btn-ghost max-sm:btn-icon-sm sm:btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              {stars !== null && (
                <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                  {formatCount(stars)}
                </span>
              )}
            </a>
            <div className="separator separator-vertical self-auto! h-4 max-sm:hidden" />
            <a
              href="https://www.npmjs.com/package/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="npm package"
              className="btn btn-ghost max-sm:btn-icon-sm sm:btn-sm max-sm:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/></svg>
              {downloads !== null && (
                <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                  {formatCount(downloads)}
                </span>
              )}
            </a>
            <div className="separator separator-vertical self-auto! h-4 max-sm:hidden" />
            <ThemeEditor className="max-sm:hidden" />
            <div className="separator separator-vertical self-auto! h-4" />
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
