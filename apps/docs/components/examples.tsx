import Link from "next/link";
import { ExampleGallery } from "@/components/example-gallery";
import { getAllCategories, getGalleryItems, allExamplesMeta } from "@/lib/examples";

type Props = {
  type?: string;
  category?: string;
};

export async function Examples({ type, category }: Props) {
  const categories = await getAllCategories();
  const items = await getGalleryItems(type, category);

  const active = category
    ? categories.find((c) => c.type === type && c.category === category)
    : null;

  const title = active?.title ?? allExamplesMeta.title;
  const description = active?.description ?? allExamplesMeta.description;

  return (
    <div className="max-w-384 mx-auto px-4 sm:px-6 pb-12">
      <div className="pb-12 pt-8 sm:py-24 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl xs:text-4xl sm:text-4xl/tight lg:text-5xl/tight font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="max-w-lg mx-auto mt-4 sm:max-w-3xl text-muted-foreground sm:text-lg/8 text-pretty">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <Link
            href="/examples"
            className={`btn btn-sm rounded-full ${!active ? "" : "btn-secondary"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/examples/${c.type}/${c.category}`}
              className={`btn btn-sm rounded-full ${c.category === category ? "" : "btn-secondary"}`}
            >
              {c.title.replace(" Examples", "")}
            </Link>
          ))}
        </div>
      </div>
      <ExampleGallery items={items} />
    </div>
  );
}
