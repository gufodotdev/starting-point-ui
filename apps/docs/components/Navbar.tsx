import { Github, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
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
            href="/docs/guides/installation"
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
  );
}
