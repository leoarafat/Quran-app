import type { Metadata } from "next";
import { BookScreen } from "@/components/hadith/BookScreen";
import { bookTopics, getHadithIndex } from "@/lib/hadith/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return getHadithIndex().index.books.flatMap((b) => bookTopics(b.slug)!.topics.map((t) => ({ slug: b.slug, topic: String(t.id) })));
}

export async function generateMetadata({ params }: PageProps<"/hadith/book/[slug]/[topic]">): Promise<Metadata> {
  const { slug, topic } = await params;
  const found = bookTopics(slug);
  return { title: `${found?.topics.find((t) => t.id === Number(topic))?.title} · ${found?.book.title}` };
}

export default async function BookTopicPage({ params }: PageProps<"/hadith/book/[slug]/[topic]">) {
  const { slug, topic } = await params;
  return <BookScreen slug={slug} topic={Number(topic)} />;
}
