import { readFile } from "fs/promises";
import { join } from "path";
import { cache } from "react";

// --- Presets ---

const presets = {
  default: "p-4 sm:p-12 flex flex-wrap items-center justify-center gap-2 max-xxs:[zoom:0.8]",
  fullpage: "",
} as const;

export type Preset = keyof typeof presets;

export type ExampleConfig = {
  preset: Preset;
  classList?: string;
  description: string;
};

export function getPresetClasses(preset: Preset): string {
  return presets[preset];
}

// --- Meta ---

export const allExamplesMeta = {
  title: "Browse Examples",
  description:
    "Explore ready-to-use components, sections, and page templates built with Tailwind CSS and Starting Point UI.",
};

export const exampleMeta: Record<
  string,
  Record<string, { title: string; description: string }>
> = {
  components: {
    card: {
      title: "Card Examples",
      description:
        "Free Tailwind CSS card examples. Copy and paste into your project. Built with Starting Point UI and works in any Tailwind project.",
    },
    sidebar: {
      title: "Sidebar Examples",
      description:
        "Free Tailwind CSS sidebar examples. Copy and paste into your project. Built with Starting Point UI and works in any Tailwind project.",
    },
  },
};

// --- Types ---

export type ExampleVariant = {
  variant: number;
  html: string;
  description: string;
  presetClasses: string;
};

export type ExampleCategory = {
  category: string;
  title: string;
  description: string;
  variants: ExampleVariant[];
};

export type ExamplesData = {
  types: {
    type: string;
    categories: ExampleCategory[];
  }[];
};

export type CategoryInfo = {
  type: string;
  category: string;
  title: string;
  description: string;
  variantCount: number;
};

// --- Data ---

const getData = cache(async (): Promise<ExamplesData> => {
  return JSON.parse(
    await readFile(join(process.cwd(), ".source", "examples.json"), "utf-8"),
  );
});

export async function getCategory(
  type: string,
  category: string,
): Promise<ExampleCategory> {
  const data = await getData();
  const cat = data.types
    .find((t) => t.type === type)
    ?.categories.find((c) => c.category === category);
  if (!cat) throw new Error(`Unknown example: ${type}/${category}`);
  return cat;
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
  const data = await getData();
  return data.types.flatMap((t) =>
    t.categories.map((c) => ({
      type: t.type,
      category: c.category,
      title: c.title,
      description: c.description,
      variantCount: c.variants.length,
    })),
  );
}

export async function generateExampleStaticParams() {
  const data = await getData();
  return data.types.flatMap((t) =>
    t.categories.map((c) => ({ type: t.type, category: c.category })),
  );
}
