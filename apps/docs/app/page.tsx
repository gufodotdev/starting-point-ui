import Link from "next/link";

export const metadata = {
  title: "Starting Point UI",
  description:
    "A component library built on top of Tailwind CSS. Framework agnostic, easy to customize, open source, and works in any project.",
};

export default function Home() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="container max-w-2xl text-center grid gap-8">
        <div className="grid gap-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Starting Point UI
          </h1>
          <p className="text-muted-foreground text-lg">
            A component library built on top of Tailwind CSS. Framework
            agnostic, easy to customize, open source, and works in any project.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/docs/guides/introduction" className="btn">
            Get Started
          </Link>
          <Link href="/docs/components/button" className="btn btn-outline">
            Components
          </Link>
        </div>
      </div>
    </div>
  );
}
