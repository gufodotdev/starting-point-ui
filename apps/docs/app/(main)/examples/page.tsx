import Link from "next/link";
import { allExamplesMeta, getAllCategories } from "@/lib/examples";
import { ExampleHeader } from "@/components/example-header";
import { CardIllustration } from "@/components/illustrations/card";
import { SidebarIllustration } from "@/components/illustrations/sidebar";

export const metadata = {
  title: allExamplesMeta.title,
  description: allExamplesMeta.description,
};

export default async function AllExamplesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-384 mx-auto px-4 sm:px-6 pb-12">
      <ExampleHeader
        title={allExamplesMeta.title}
        description={allExamplesMeta.description}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/examples/${c.type}/${c.category}`}
            className="block hover:opacity-90 transition-opacity text-center"
          >
            <div className="flex items-center justify-center h-64 rounded-xl bg-muted p-8 *:w-full">
              {c.category === "sidebar" ? <SidebarIllustration /> : <CardIllustration />}
            </div>
            <h2 className="mt-6 text-base/none font-semibold">
              {c.title.replace(" Examples", "")}
            </h2>
            <p className="mt-3 text-sm/none text-muted-foreground">
              {c.variantCount} examples
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
