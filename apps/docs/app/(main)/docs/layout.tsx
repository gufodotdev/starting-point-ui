import { Sidebar } from "@/components/sidebar";
import { TableOfContents } from "@/components/table-of-contents";

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

      <main className="flex-1 min-w-0 py-6 lg:py-12 *:max-w-3xl *:mx-auto">
        <article id="content">{children}</article>
      </main>

      {/* Table of contents */}
      <aside className="hidden xl:block w-(--toc-width) shrink-0 sticky top-(--navbar-height) h-[calc(100dvh-var(--navbar-height))] py-6 pl-6">
        <h4 className="menu-label mb-3 px-0">On this page</h4>
        <TableOfContents />
      </aside>
    </div>
  );
}
