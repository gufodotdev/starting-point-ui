export default function DocSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article
      id="content"
      className="mx-auto w-full max-w-160 py-6 text-[1.05rem] sm:text-[15px] lg:py-8"
    >
      {children}
    </article>
  );
}
