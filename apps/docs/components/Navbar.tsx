import { Github } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 h-(--navbar-height) border-b bg-background">
      <div className="container-wide h-full flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1">
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
