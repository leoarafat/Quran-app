import type { Metadata } from "next";
import { BookScreen } from "@/components/hadith/BookScreen";
import { getHadithIndex } from "@/lib/hadith/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return getHadithIndex().index.books.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/book/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getHadithIndex().index.books.find((b) => b.slug === slug)?.title };
}

export default async function BookPage({ params }: PageProps<"/hadith/book/[slug]">) {
  return <BookScreen slug={(await params).slug} />;
}
