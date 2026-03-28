import type { Metadata } from "next";
import { getCategory, getVariant, generateVariantStaticParams } from "@/lib/examples";
import { Example } from "@/components/example";
import prettier from "prettier/standalone";
import htmlParser from "prettier/plugins/html";
import { codeToHtml } from "shiki";

export const dynamicParams = false;

type Params = Promise<{ type: string; category: string; variant: string }>;

export const generateStaticParams = generateVariantStaticParams;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { type, category, variant } = await params;
  const cat = await getCategory(type, category);
  const label = cat.title.replace(" Examples", "");
  return {
    title: `${label} Example ${variant}`,
    description: cat.description,
  };
}

export default async function VariantPage({ params }: { params: Params }) {
  const { type, category, variant } = await params;
  const cat = await getCategory(type, category);
  const v = await getVariant(`${type}/${category}/${variant}`);

  const formattedHtml = await prettier.format(v.html, {
    parser: "html",
    plugins: [htmlParser],
    printWidth: 80,
    tabWidth: 2,
    htmlWhitespaceSensitivity: "ignore",
  });

  const highlightedCode = await codeToHtml(formattedHtml, {
    lang: "html",
    themes: { dark: "github-dark", light: "github-light" },
  });

  return (
    <Example
      type={type}
      category={category}
      categoryLabel={cat.title.replace(" Examples", "")}
      variant={variant}
      viewSrc={`/view/${type}/${category}/${variant}`}
      code={formattedHtml}
      highlightedCode={highlightedCode}
      previewImageLight={`/screenshots/${type}-${category}-${variant}-light.webp`}
      previewImageDark={`/screenshots/${type}-${category}-${variant}-dark.webp`}
    />
  );
}
