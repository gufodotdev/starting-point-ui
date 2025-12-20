import { Github, Menu, PanelLeftClose } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";

export function Navbar() {
  return (
    <>
      <nav className="sticky top-0 h-(--navbar-height) border-b border-dashed bg-background z-10">
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
            <a
              href="/docs/guides/introduction"
              className="btn btn-ghost btn-sm max-lg:hidden"
            >
              Docs
            </a>
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
        <div className="dialog-backdrop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-300"></div>
        <div className="dialog-panel top-0 left-0 h-dvh w-(--sidebar-width) max-h-none rounded-none translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left duration-300">
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
