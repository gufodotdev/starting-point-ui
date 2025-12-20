import { PanelLeftClose } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TableOfContents } from "@/components/TableOfContents";
import { SectionHeading } from "@/components/SectionHeading";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wide flex gap-12">
      {/* Mobile sheet */}
      <dialog id="mobile-nav" className="dialog">
        <div className="dialog-backdrop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-300"></div>
        <div className="dialog-panel top-0 left-0 h-dvh w-(--sidebar-width) max-h-none rounded-none translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left duration-300">
          <button
            type="button"
            className="btn btn-ghost btn-icon-sm mb-6 text-muted-foreground"
            aria-label="Close navigation menu"
            data-sp-dismiss="dialog"
          >
            <PanelLeftClose />
          </button>
          <Sidebar />
        </div>
      </dialog>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-(--sidebar-width) border-r border-dashed sticky top-(--navbar-height) h-[calc(100vh-var(--navbar-height))] py-12 pr-6 -ml-3">
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
