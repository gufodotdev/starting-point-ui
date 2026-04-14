import Link from "next/link";
import { getAllCategories } from "@/lib/examples";

type Props = {
  title: string;
  description: string;
  activeCategory?: string;
};

export async function ExampleHeader({
  title,
  description,
  activeCategory,
}: Props) {
  const categories = await getAllCategories();

  return (
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
          className={`btn btn-sm rounded-full ${!activeCategory ? "btn-primary" : "btn-secondary"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/examples/${c.type}/${c.category}`}
            className={`btn btn-sm rounded-full ${c.category === activeCategory ? "btn-primary" : "btn-secondary"}`}
          >
            {c.title.replace(" Examples", "")}
          </Link>
        ))}
      </div>
    </div>
  );
}
