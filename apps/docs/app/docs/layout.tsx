import { Sidebar } from "@/components/sidebar";
import { TableOfContents } from "@/components/table-of-contents";
import { SectionHeading } from "@/components/section-heading";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wide flex gap-12">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-(--sidebar-width) border-r sticky top-(--navbar-height) h-[calc(100vh-var(--navbar-height))] py-12 pr-6 -ml-3 overflow-y-auto">
        <Sidebar />
      </aside>

      <main className="flex-1 min-w-0 py-6 lg:py-12">
        <article id="content">{children}</article>
      </main>

      {/* Table of contents */}
      <aside className="hidden xl:block w-(--toc-width) sticky top-(--navbar-height) h-[calc(100vh-var(--navbar-height))] py-12 pl-6">
        <SectionHeading className="mb-3">On this page</SectionHeading>
        <TableOfContents />
      </aside>
    </div>
  );
}
