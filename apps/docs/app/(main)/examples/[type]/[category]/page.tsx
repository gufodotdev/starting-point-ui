import type { Metadata } from "next";
import { getCategory, generateExampleStaticParams } from "@/lib/examples";
import { Example } from "@/components/example";
import { ExampleHeader } from "@/components/example-header";

export const dynamicParams = false;

type Params = Promise<{ type: string; category: string }>;

export const generateStaticParams = generateExampleStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type, category } = await params;
  const cat = await getCategory(type, category);
  return { title: cat.title, description: cat.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Params;
}) {
  const { type, category } = await params;
  const cat = await getCategory(type, category);

  const examples = cat.variants.map((v) => ({
    variant: v.variant,
    highlightedCode: v.html,
  }));

  return (
    <div className="max-w-384 mx-auto px-4 sm:px-6 pb-12">
      <ExampleHeader
        title={cat.title}
        description={cat.description}
        activeCategory={category}
      />
      <div className="space-y-12">
        {examples.map((ex) => (
          <Example
            key={ex.variant}
            variant={ex.variant}
            viewSrc={`/view/${type}/${category}/${ex.variant}`}
            highlightedCode={ex.highlightedCode}
          />
        ))}
      </div>
    </div>
  );
}
