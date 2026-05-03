import { notFound } from "next/navigation";
import { readdir } from "fs/promises";
import { join } from "path";
import type { Metadata } from "next";
import { getPresetClasses, type Preset } from "@/lib/examples";

export const dynamicParams = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const EXAMPLES_DIR = join(process.cwd(), "examples");

type Params = Promise<{ type: string; category: string; variant: string }>;

export async function generateStaticParams() {
  const params: { type: string; category: string; variant: string }[] = [];

  const types = await readdir(EXAMPLES_DIR, { withFileTypes: true });
  for (const type of types.filter((e) => e.isDirectory())) {
    const categories = await readdir(join(EXAMPLES_DIR, type.name), { withFileTypes: true });
    for (const category of categories.filter((e) => e.isDirectory())) {
      const files = await readdir(join(EXAMPLES_DIR, type.name, category.name));
      for (const file of files.filter((f) => f.endsWith(".tsx"))) {
        params.push({
          type: type.name,
          category: category.name,
          variant: file.replace(".tsx", ""),
        });
      }
    }
  }

  return params;
}

export default async function ViewPage({ params }: { params: Params }) {
  const { type, category, variant } = await params;

  let Component: React.ComponentType;
  let preset: Preset | undefined;
  try {
    const mod = await import(`@/examples/${type}/${category}/${variant}`);
    Component = mod.default;
    preset = mod.config?.preset;
  } catch {
    return notFound();
  }

  const classes = preset ? getPresetClasses(preset) : "";

  return (
    <div className={`lg:min-h-dvh bg-background ${classes}`}>
      <Component />
    </div>
  );
}
