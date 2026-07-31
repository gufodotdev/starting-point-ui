import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { LandingGrid } from "@/components/landing-grid";

export const metadata: Metadata = {
  title: "Beautiful Components for Tailwind CSS",
  description:
    "An open-source component library for Tailwind CSS. Inspired by shadcn/ui, Starting Point UI gives you the same beautiful design system without locking you into a framework.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="relative grid min-h-[calc(100dvh-var(--navbar-height))] grid-cols-1 overflow-x-clip lg:grid-cols-12 lg:overflow-clip">
      <div className="relative flex flex-col justify-center px-6 py-6 lg:col-span-6 lg:items-center xl:col-span-5">
        <div className="max-w-xl lg:-mt-(--navbar-height)">
          <Link
            href="/changelog"
            className="badge badge-secondary gap-1.5 rounded-full px-3 py-1 text-sm font-normal"
          >
            <span className="size-2 rounded-full bg-blue-500" />
            New: RTL support
            <ArrowRight />
          </Link>
          <h1 className="xs:text-4xl/tight mt-6 text-3xl/tight font-extrabold tracking-tight lg:text-5xl/tight">
            The Starting Point <br /> for Your Next Project
          </h1>
          <p
            className="mt-6 max-w-132 text-pretty hyphens-auto text-muted-foreground sm:text-lg/7"
            lang="en"
          >
            A Tailwind CSS component library that brings the shadcn/ui design
            system to any web stack, no React required.
          </p>
          <div className="mt-10 grid gap-4 sm:flex">
            <Link
              href="/guides/installation"
              className="btn lg:btn-lg"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary lg:btn-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              View Source
            </a>
          </div>
          <div className="mt-6 lg:hidden">
            <ScrollIndicator />
          </div>
        </div>
      </div>
      <div
        id="landing-grid"
        data-nosnippet=""
        className="relative flex items-start overflow-x-auto px-6 max-lg:mask-[linear-gradient(to_right,black_90%,transparent)] lg:col-span-6 lg:max-h-[calc(100dvh-var(--navbar-height))] lg:overflow-clip lg:px-0 xl:col-span-7"
      >
        <LandingGrid />
      </div>
      <footer className="flex h-(--navbar-height) items-center px-6 text-sm text-muted-foreground lg:absolute lg:bottom-0 lg:left-0 lg:col-span-6 xl:col-span-5">
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
