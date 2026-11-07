import { TocSidebar } from "@/components/toc-sidebar";

export default async function DocSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const example = slug[0] === "examples";

  return (
    <div className="flex items-stretch pb-8 text-[1.05rem] sm:text-[15px] lg:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <article
          id="content"
          className={`mx-auto w-full min-w-0 flex-1 px-6 py-6 lg:py-8 ${example ? "max-w-[calc(1336px+3rem)]" : "max-w-7xl"}`}
        >
          {children}
        </article>
      </div>
      {!example && <TocSidebar />}
    </div>
  );
}
