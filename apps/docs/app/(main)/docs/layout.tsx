import { Sidebar } from "@/components/sidebar";
import { TableOfContents } from "@/components/table-of-contents";
import { TocCta } from "@/components/toc-cta";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-12 px-4">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-(--sidebar-width) shrink-0 sticky top-(--navbar-height) h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
        <div className="h-full py-6 pr-6 overflow-y-auto scrollbar-none">
          <Sidebar />
        </div>
      </aside>

      <main className="flex-1 min-w-0 py-6 lg:py-12 *:max-w-160 *:mx-auto">
        <article id="content" className="text-[1.05rem] sm:text-[15px]">
          {children}
        </article>
      </main>

      {/* Table of contents */}
      <div className="sticky top-(--navbar-height) z-30 ml-auto hidden h-[90svh] w-(--toc-width) shrink-0 flex-col gap-4 overflow-hidden overscroll-none pb-8 pt-6 xl:flex">
        <div className="scrollbar-none flex flex-col gap-8 overflow-y-auto px-8">
          <div className="flex flex-col gap-2 text-sm">
            <p className="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground">
              On This Page
            </p>
            <TableOfContents />
          </div>
        </div>
        <div className="hidden flex-1 flex-col gap-6 px-6 pt-4 xl:flex">
          <TocCta />
        </div>
      </div>
    </div>
  );
}
