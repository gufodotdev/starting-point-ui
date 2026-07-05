import { TocSidebar } from "@/components/toc-sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
};

export default async function DocSectionLayout({ children, params }: Props) {
  const { slug } = await params;
  const wide = slug[0] !== "guides";

  return (
    <div className="flex min-w-0 gap-8 px-4 sm:px-8 lg:px-12">
      <article
        id="content"
        className={`mx-auto w-full min-w-0 py-10 text-[1.05rem] sm:text-[15px] lg:py-16 ${
          wide ? "max-w-7xl" : "max-w-180"
        }`}
      >
        {children}
      </article>
      <TocSidebar variant={wide ? "wide" : "guide"} />
    </div>
  );
}
