import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/hadith/ChapterList";
import { FullNote } from "@/components/hadith/FullNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { toBnDigits } from "@/lib/bn";
import { getFullBook, getFullIndex } from "@/lib/hadith/books";

export const dynamicParams = false;

export function generateStaticParams() {
  return getFullIndex().books.map((b) => ({ book: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/full/[book]">): Promise<Metadata> {
  const title = getFullBook((await params).book)?.title;
  return { title: `${title}: পূর্ণ গ্রন্থ (আরবি)` };
}

export default async function FullBookPage({ params }: PageProps<"/hadith/full/[book]">) {
  const book = getFullBook((await params).book);
  if (!book) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:max-w-5xl">
      <ScreenHeader title={book.title} back={{ href: "/hadith/", label: "হাদিসে ফিরে যান" }} />
      <h1 className="font-display text-2xl font-bold max-md:hidden">{book.title}</h1>
      <p className="text-sm leading-relaxed text-ink2">
        {toBnDigits(book.total)}টি হাদিস (আরবি) · {toBnDigits(book.chapters.filter((c) => c.id > 0).length)}টি অধ্যায়।
        {book.bangla > 0 ? ` ${toBnDigits(book.bangla)}টি হাদিস থেকে বাংলা অনুবাদ ও ব্যাখ্যায় যাওয়া যায়; বাকিগুলোর অনুমোদিত বাংলা অনুবাদ এখনো যোগ হয়নি।` : " এই গ্রন্থের অনুমোদিত বাংলা অনুবাদ এখনো যোগ হয়নি।"}
      </p>
      <ChapterList book={book.slug} chapters={book.chapters} />
      <FullNote source={getFullIndex().source} />
    </div>
  );
}
