import { notFound } from "next/navigation";
import { getDocBySlug, getAllDocSlugs } from "@/lib/mdx";
import { CustomMDX, exampleHubHeadings } from "@/components/mdx";
import { CopyContextButton } from "@/components/copy-context-button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) return {};

  const title = doc.metadata.seoTitle ?? doc.metadata.title;
  const description = doc.metadata.description;
  const url = `/${slug.join("/")}`;
  const cardTitle = ["components", "examples"].includes(slug[0])
    ? title.replace(/^Tailwind CSS /, "")
    : title;
  const cardDescription = description.replace(/\s*Easily customizable\.$/, "");
  const image = `/og?title=${encodeURIComponent(cardTitle)}&description=${encodeURIComponent(cardDescription)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Starting Point UI",
      locale: "en_US",
      url,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
        <h1
          id="introduction"
          className="text-3xl font-bold tracking-tight scroll-mt-18"
        >
          {doc.metadata.title}
        </h1>
        <CopyContextButton content={doc.content} />
      </div>
      <CustomMDX
        source={doc.content}
        components={
          slug[0] === "examples" && slug.length === 2
            ? exampleHubHeadings(`/${slug.join("/")}`)
            : undefined
        }
      />
    </>
  );
}
