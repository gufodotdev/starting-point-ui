import { DocsSidebar } from "@/components/docs-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div data-slot="docs" className="container-wrapper flex flex-1 flex-col">
      <div
        className="flex min-h-min w-full flex-1 flex-col items-start px-0 [--top-spacing:0] xl:grid xl:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] xl:[--top-spacing:--spacing(4)]"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <DocsSidebar />
        <div className="h-full w-full">{children}</div>
      </div>
        <SiteFooter />
      </div>
    </>
  );
}
