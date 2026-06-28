type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
};

// Guides read as prose, so they stay narrow. Component (and later example) pages
// showcase wide previews, so they get a wider article.
export default async function DocSectionLayout({ children, params }: Props) {
  const { slug } = await params;
  const wide = slug[0] !== "guides";

  return (
    <article
      id="content"
      className={`mx-auto w-full py-6 text-sm/6 lg:py-12 ${
        wide ? "max-w-7xl" : "max-w-160"
      }`}
    >
      {children}
    </article>
  );
}
