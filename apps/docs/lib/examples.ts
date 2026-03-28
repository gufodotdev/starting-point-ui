import { readFile } from "fs/promises";
import { join } from "path";
import { cache } from "react";

// --- Presets ---

const presets = {
  default: "p-4 sm:p-12 flex flex-wrap items-center justify-center gap-2",
} as const;

export type Preset = keyof typeof presets;

export type ExampleConfig = {
  preset: Preset;
  classList?: string;
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
  },
};

// --- Types ---

export type ExampleVariant = {
  variant: number;
  html: string;
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

export type GalleryItem = {
  type: string;
  category: string;
  variant: number;
  imageLight: string;
  imageDark: string;
};

export type CategoryInfo = {
  type: string;
  category: string;
  title: string;
  description: string;
};

// --- Data ---

const getData = cache(async (): Promise<ExamplesData> => {
  return JSON.parse(
    await readFile(join(process.cwd(), ".source", "examples.json"), "utf-8"),
  );
});

function screenshotSrc(
  type: string,
  category: string,
  variant: number,
  theme: "light" | "dark",
) {
  return `/screenshots/${type}-${category}-${variant}-${theme}.webp`;
}

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

export async function getVariant(path: string): Promise<ExampleVariant> {
  const [type, category, variantStr] = path.split("/");
  const variant = parseInt(variantStr, 10);
  const cat = await getCategory(type, category);
  const v = cat.variants.find((v) => v.variant === variant);
  if (!v) throw new Error(`Example not found: ${path}`);
  return v;
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
  const data = await getData();
  return data.types.flatMap((t) =>
    t.categories.map((c) => ({
      type: t.type,
      category: c.category,
      title: c.title,
      description: c.description,
    })),
  );
}

export async function getGalleryItems(
  type?: string,
  category?: string,
): Promise<GalleryItem[]> {
  const data = await getData();

  if (type && category) {
    const cat = data.types
      .find((t) => t.type === type)
      ?.categories.find((c) => c.category === category);
    if (!cat) return [];
    return cat.variants.map((v) => ({
      type,
      category,
      variant: v.variant,
      imageLight: screenshotSrc(type, category, v.variant, "light"),
      imageDark: screenshotSrc(type, category, v.variant, "dark"),
    }));
  }

  return data.types.flatMap((t) =>
    t.categories.flatMap((c) =>
      c.variants.map((v) => ({
        type: t.type,
        category: c.category,
        variant: v.variant,
        imageLight: screenshotSrc(t.type, c.category, v.variant, "light"),
        imageDark: screenshotSrc(t.type, c.category, v.variant, "dark"),
      })),
    ),
  );
}

export async function generateExampleStaticParams() {
  const data = await getData();
  return data.types.flatMap((t) =>
    t.categories.map((c) => ({ type: t.type, category: c.category })),
  );
}

export async function generateVariantStaticParams() {
  const data = await getData();
  return data.types.flatMap((t) =>
    t.categories.flatMap((c) =>
      c.variants.map((v) => ({
        type: t.type,
        category: c.category,
        variant: String(v.variant),
      })),
    ),
  );
}
