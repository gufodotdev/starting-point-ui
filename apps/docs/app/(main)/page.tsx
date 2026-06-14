import Link from "next/link";
import type { Metadata } from "next";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { LandingGrid } from "@/components/landing-grid";
import { ThemeEditorTrigger } from "@/components/theme-editor-trigger";

export const metadata: Metadata = {
  title: "Beautiful Components for Tailwind CSS",
  description:
    "An open-source component library for Tailwind CSS. Inspired by shadcn/ui, Starting Point UI gives you the same beautiful design system without locking you into a framework.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100dvh-var(--navbar-height))] overflow-x-hidden lg:overflow-hidden">
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col lg:items-center justify-center px-4 sm:px-6 py-6">
        <div className="max-w-xl lg:-mt-(--navbar-height)">
          <span className="badge badge-secondary">
            25+ accessible components for Tailwind CSS
          </span>
          <h1 className="mt-6 text-3xl/tight xs:text-4xl/tight lg:text-5xl/tight font-extrabold tracking-tight">
            The Starting Point <br /> for Your Next Project
          </h1>
          <p
            className="mt-4 text-muted-foreground sm:text-lg/8 text-pretty hyphens-auto"
            lang="en"
          >
            Starting Point UI is an open-source component library built for
            Tailwind CSS. Beautiful, accessible, and works in any project.
          </p>
          <div className="mt-6 lg:mt-8 grid xs:flex gap-3">
            <Link
              href="/docs/guides/installation"
              className="btn btn-primary lg:btn-lg"
            >
              Get Started
            </Link>
            <ThemeEditorTrigger />
          </div>
          <div className="lg:hidden mt-6">
            <ScrollIndicator />
          </div>
        </div>
      </div>
      <div
        id="landing-grid"
        className="lg:col-span-6 xl:col-span-7 lg:overflow-hidden overflow-x-auto flex items-start lg:max-h-[calc(100dvh-var(--navbar-height))] px-4 sm:px-6 lg:px-0 max-lg:mask-[linear-gradient(to_right,black_90%,transparent)]"
      >
        <LandingGrid />
      </div>
      <footer className="lg:absolute lg:bottom-0 lg:left-0 lg:col-span-6 xl:lg:col-span-5 h-(--navbar-height) flex items-center px-4 sm:px-6 text-sm text-muted-foreground">
        <p>
          Built by Gufo. Source on{" "}
          <a
            href="https://github.com/gufodotdev/starting-point-ui"
            className="underline underline-offset-4 hover:text-foreground"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
