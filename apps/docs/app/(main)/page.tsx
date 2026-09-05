import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { version } from "@/lib/version";
import { LandingCards } from "@/components/landing-cards";

const title = "Beautiful Components for Tailwind CSS";
const description =
  "An open-source component library for Tailwind CSS. Inspired by shadcn/ui, Starting Point UI gives you the same beautiful design system without locking you into a framework.";
const image = `/og?title=${encodeURIComponent("Starting Point UI")}&description=${encodeURIComponent("A Tailwind CSS component library that brings the shadcn/ui design system to any web project, no React required.")}`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Starting Point UI",
    locale: "en_US",
    url: "/",
    images: [{ url: image, width: 1200, height: 630, alt: title }],
  },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section>
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
          <Link href="/changelog" className="badge badge-secondary bg-muted">
            New in v{version} <ArrowRight />
          </Link>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
            The Starting Point for Your Next Project
          </h1>
          <p className="max-w-4xl text-base text-balance text-foreground sm:text-lg">
            A Tailwind CSS component library that brings the shadcn/ui design
            system to any web project, no React required.
          </p>
          <div className="flex w-full items-center justify-center gap-2 pt-2">
            <Link href="/guides/installation" className="btn btn-sm shadow-none">
              Get Started
            </Link>
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm bg-muted shadow-none"
            >
              View Source
            </a>
          </div>
        </div>
      </section>
      <div data-nosnippet="" className="flex-1 overflow-hidden">
        <section className="w-[140vw] overflow-hidden md:w-full lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/landing-cards-light.png"
            width={2560}
            height={2764}
            alt="Component cards"
            className="block h-auto w-full dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/landing-cards-dark.png"
            width={2560}
            height={2764}
            alt="Component cards"
            className="hidden h-auto w-full dark:block"
          />
        </section>
        <section className="hidden lg:block">
          <LandingCards />
        </section>
      </div>
      <footer className="flex h-(--navbar-height) items-center justify-center px-6 text-sm text-muted-foreground">
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
