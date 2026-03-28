import type { Metadata } from "next";
import { getCategory, generateExampleStaticParams } from "@/lib/examples";
import { Examples } from "@/components/examples";

export const dynamicParams = false;

type Params = Promise<{ type: string; category: string }>;

export const generateStaticParams = generateExampleStaticParams;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { type, category } = await params;
  const cat = await getCategory(type, category);
  return { title: cat.title, description: cat.description };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { type, category } = await params;
  return <Examples type={type} category={category} />;
}
