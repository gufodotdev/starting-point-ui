import { SiteHeader } from "@/components/site-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="group/layout relative z-10 flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
