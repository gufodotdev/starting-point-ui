import Link from "next/link";
import { MobileLink } from "@/components/mobile-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeEditor } from "@/components/theme-editor";
import { SearchDialog } from "@/components/search-dialog";
import { docsNav, mainNav } from "@/lib/navigation";
import {
  formatCount,
  getGithubStars,
  getNpmDownloads,
} from "@/lib/stats";

export async function SiteHeader() {
  const [stars, downloads] = await Promise.all([
    getGithubStars(),
    getNpmDownloads(),
  ]);

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-4 sm:px-6">
        <div className="flex h-(--navbar-height) items-center gap-2">
          <button
            type="button"
            id="mobile-nav-trigger"
            className="group btn btn-ghost btn-sm -ml-2 gap-2.5 px-2 hover:bg-transparent xl:hidden"
            aria-label="Toggle navigation menu"
          >
            <div className="relative size-4">
              <span className="absolute top-1 left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 group-aria-expanded:top-[0.4rem] group-aria-expanded:-rotate-45" />
              <span className="absolute top-2.5 left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 group-aria-expanded:top-[0.4rem] group-aria-expanded:rotate-45" />
            </div>
            <span className="flex items-center text-lg leading-none font-medium">
              Menu
            </span>
          </button>
          <nav className="-ml-2.5 hidden items-center xl:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="btn btn-ghost btn-sm px-2.5"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="-mr-2 ml-auto flex items-center gap-2">
            <SearchDialog />
            <div className="separator separator-vertical self-auto! h-4" />
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="btn btn-ghost max-sm:btn-sm btn-icon sm:btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              {stars !== null && (
                <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
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
              className="btn btn-ghost max-sm:btn-sm btn-icon sm:btn-sm max-sm:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/></svg>
              {downloads !== null && (
                <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                  {formatCount(downloads)}
                </span>
              )}
            </a>
            <div className="separator separator-vertical self-auto! h-4 max-sm:hidden" />
            <ThemeEditor className="max-sm:hidden" />
            <div className="separator separator-vertical self-auto! h-4" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        data-sp-toggle="#mobile-nav-trigger"
        data-sp-static
        className="popover scrollbar-none inset-x-0 top-(--navbar-height) bottom-0 h-auto w-auto gap-12 overflow-y-auto rounded-none bg-background/90 p-6 shadow-none ring-0 backdrop-blur xl:hidden [&.show]:zoom-in-100 [&.hide]:zoom-out-100"
      >
        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium text-muted-foreground">Menu</div>
          <div className="flex flex-col gap-3">
            {mainNav.map((item) => (
              <MobileLink key={item.href} href={item.href}>
                {item.title}
              </MobileLink>
            ))}
          </div>
        </div>
        {docsNav.map((group) => (
          <div key={group.title} className="flex flex-col gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              {group.title}
            </div>
            <div className="flex flex-col gap-3">
              {group.items.map((item) => (
                <MobileLink key={item.href} href={item.href}>
                  {item.title}
                </MobileLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
