import { TocSidebar } from "@/components/toc-sidebar";

export default function DocSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-stretch pb-8 text-[1.05rem] sm:text-[15px] lg:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <article
          id="content"
          className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-6 py-6 lg:py-8"
        >
          {children}
        </article>
      </div>
      <TocSidebar />
    </div>
  );
}
