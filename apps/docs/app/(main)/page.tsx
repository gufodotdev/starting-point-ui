import Link from "next/link";
import type { Metadata } from "next";
import { ThemeEditorTrigger } from "@/components/theme-editor-trigger";

export const metadata: Metadata = {
  title: "Beautiful Components for Tailwind CSS",
  description:
    "An open-source component library for Tailwind CSS. Inspired by shadcn/ui, Starting Point UI gives you the same beautiful design system without locking you into a framework.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section>
        <div className="container-wrapper">
          <div className="container flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
            <span className="badge badge-secondary">
              25+ accessible components for Tailwind CSS
            </span>
            <h1 className="leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
              The Starting Point for Your Next Project
            </h1>
            <p className="max-w-4xl text-base text-balance text-foreground sm:text-lg">
              Starting Point UI is an open-source component library built for
              Tailwind CSS. Beautiful, accessible, and works in any project.
            </p>
            <div className="flex w-full items-center justify-center gap-2 pt-2">
              <Link href="/guides/installation" className="btn btn-sm">
                Get Started
              </Link>
              <ThemeEditorTrigger />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
