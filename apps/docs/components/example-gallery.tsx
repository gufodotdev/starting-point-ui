import Link from "next/link";
import {
  categoryLabel,
  getAllCategories,
  screenshotUrl,
  type ExampleVariant,
} from "@/lib/examples";

type Props = {
  title: string;
  description: string;
  variants: ExampleVariant[];
  activeCategory?: string;
};

export async function ExampleGallery({
  title,
  description,
  variants,
  activeCategory,
}: Props) {
  const categories = await getAllCategories();

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
            className={`btn btn-sm rounded-full ${!activeCategory ? "" : "btn-secondary"}`}
          >
            Featured
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/examples/${c.type}/${c.category}`}
              className={`btn btn-sm rounded-full ${c.category === activeCategory ? "" : "btn-secondary"}`}
            >
              {categoryLabel(c.category)}
            </Link>
          ))}
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {variants.map((v) => (
          <Link
            key={`${v.type}-${v.category}-${v.variant}`}
            href={`/examples/${v.type}/${v.category}/${v.variant}`}
            prefetch={false}
            className="mb-4 break-inside-avoid block overflow-hidden rounded-md bg-muted"
          >
            <div className="m-3 p-1 rounded bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl(v, "light")}
                alt={`${v.category} example ${v.variant}`}
                className="w-full rounded-md overflow-hidden dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl(v, "dark")}
                alt={`${v.category} example ${v.variant}`}
                className="w-full rounded-md overflow-hidden hidden dark:block"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
