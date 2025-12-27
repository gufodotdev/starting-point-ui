import { notFound } from "next/navigation";
import { getDocBySlug, getAllDocSlugs, type DocMetadata } from "@/lib/mdx";
import { CustomMDX } from "@/components/mdx";
import { CopyContextButton } from "@/components/copy-context-button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold tracking-tight scroll-mt-20">
          {doc.metadata.title}
        </h1>
        <CopyContextButton content={doc.content} />
      </div>
      <CustomMDX source={doc.content} />
    </>
  );
}
