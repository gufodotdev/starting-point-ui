export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-4">
      <article
        id="content"
        className="mx-auto w-full max-w-160 py-6 text-sm/6 lg:py-12"
      >
        {children}
      </article>
    </div>
  );
}
