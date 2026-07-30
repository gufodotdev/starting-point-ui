import Link from "next/link";
import { MobileLink } from "@/components/mobile-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchDialog } from "@/components/search-dialog";
import { docsNav, mainNav } from "@/lib/navigation";
import { version } from "@/lib/version";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-6">
        <div className="flex h-(--navbar-height) items-center gap-2">
          <Link href="/" className="flex h-10 min-w-0 items-center gap-2 text-foreground">
            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-primary text-base leading-none text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0"><path d="M6.5 16.5 16.5 6.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><circle cx="17" cy="17" r="2.5" /></svg>
            </span>
            <span className="truncate text-sm font-medium">Starting Point</span>
          </Link>
          <div className="separator separator-vertical self-auto! h-4 max-md:hidden" />
          <span className="text-xs text-muted-foreground tabular-nums max-md:hidden">
            v{version}
          </span>
          <div className="-mr-2 ml-auto flex items-center gap-1">
            <nav className="hidden items-center lg:flex">
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
            <SearchDialog />
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="btn btn-ghost btn-sm btn-icon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <ThemeToggle />
            <button
              type="button"
              id="mobile-nav-trigger"
              className="group btn btn-ghost btn-sm btn-icon lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <div className="relative size-4">
                <span className="absolute top-1 left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 group-aria-expanded:top-[0.4rem] group-aria-expanded:-rotate-45" />
                <span className="absolute top-2.5 left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 group-aria-expanded:top-[0.4rem] group-aria-expanded:rotate-45" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        data-sp-toggle="#mobile-nav-trigger"
        data-sp-static
        className="popover scrollbar-none inset-x-0 top-(--navbar-height) bottom-0 h-auto w-auto gap-12 overflow-y-auto rounded-none bg-background/90 p-6 shadow-none ring-0 backdrop-blur lg:hidden [&.show]:zoom-in-100 [&.hide]:zoom-out-100"
      >
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
