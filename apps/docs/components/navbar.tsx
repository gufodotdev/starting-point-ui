import Link from "next/link";
import { Github, Menu, PanelLeftClose } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";

export function Navbar() {
  return (
    <>
      <nav className="sticky top-0 h-(--navbar-height) border-b bg-background z-10">
        <div className="container-wide h-full flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-icon-sm lg:hidden -ml-2"
              aria-label="Open navigation menu"
              data-sp-toggle="dialog"
              data-sp-target="#mobile-nav"
            >
              <Menu />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/docs/guides/introduction"
              className="btn btn-ghost btn-sm max-lg:hidden"
            >
              Docs
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
        </div>
      </nav>

      {/* Mobile navigation */}
      <dialog id="mobile-nav" className="dialog">
        <div className="sheet-backdrop"></div>
        <div className="sheet-panel w-(--sidebar-width) rounded-none">
          <button
            type="button"
            className="btn btn-ghost btn-icon-sm mb-6 text-muted-foreground"
            aria-label="Close navigation menu"
            data-sp-dismiss="dialog"
          >
            <PanelLeftClose />
          </button>
          <Sidebar />
        </div>
      </dialog>
    </>
  );
}
