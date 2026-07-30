import { DocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-slot="docs" className="container-wrapper flex flex-1 flex-col">
      <div
        className="flex min-h-min w-full flex-1 flex-col items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:--spacing(4)]"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <DocsSidebar />
        <div className="h-full w-full">{children}</div>
      </div>
    </div>
  );
}
