import { SiteFooter } from "@/components/site-footer";

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
