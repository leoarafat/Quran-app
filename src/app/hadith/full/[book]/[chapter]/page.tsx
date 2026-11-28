import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterReader } from "@/components/hadith/ChapterReader";
import { FullNote } from "@/components/hadith/FullNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { getFullBook, getFullIndex } from "@/lib/hadith/books";

export const dynamicParams = false;

export function generateStaticParams() {
  return getFullIndex().books.flatMap((b) => b.chapters.map((c) => ({ book: b.slug, chapter: String(c.id) })));
}

async function find(params: Promise<{ book: string; chapter: string }>) {
  const { book: slug, chapter } = await params;
  const book = getFullBook(slug);
  const at = book?.chapters.findIndex((c) => String(c.id) === chapter) ?? -1;
  return book && at >= 0 ? { book, at } : null;
}

export async function generateMetadata({ params }: PageProps<"/hadith/full/[book]/[chapter]">): Promise<Metadata> {
  const found = await find(params);
  return found ? { title: `${found.book.chapters[found.at].title} · ${found.book.title}` } : {};
}

export default async function ChapterPage({ params }: PageProps<"/hadith/full/[book]/[chapter]">) {
  const found = await find(params);
  if (!found) notFound();
  const { book, at } = found;
  const chapter = book.chapters[at];
  const previous = book.chapters[at - 1];
  const next = book.chapters[at + 1];
  const step = "flex min-h-14 flex-1 items-center gap-2 rounded-md border border-ln2 bg-sf px-3 py-2 text-sm font-semibold hover:border-ac";

  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:max-w-4xl">
      <ScreenHeader title={chapter.title} back={{ href: `/hadith/full/${book.slug}/`, label: `${book.title}-এর অধ্যায় তালিকায় ফিরে যান` }} />
      <h1 className="font-display text-2xl font-bold max-md:hidden">{chapter.title}</h1>
      <p className="text-sm text-ink2">
        <Link href={`/hadith/full/${book.slug}/`} className="text-ac underline">{book.title}</Link>
        {chapter.id > 0 && ` · অধ্যায় ${toBnDigits(chapter.id)}`} · {toBnDigits(chapter.count)}টি হাদিস · <span lang="en">{chapter.english}</span>
      </p>
      <ChapterReader key={`${book.slug}-${chapter.id}`} book={book.slug} chapter={chapter.id} title={book.title} />
      <nav aria-label="আগের ও পরের অধ্যায়" className="flex flex-col gap-2 sm:flex-row">
        {previous && <Link href={`/hadith/full/${book.slug}/${previous.id}/`} prefetch={false} className={step}><Icon name="back" className="size-5 shrink-0 text-ac" /><span>{previous.title}</span></Link>}
        {next && <Link href={`/hadith/full/${book.slug}/${next.id}/`} prefetch={false} className={`${step} justify-between text-right`}><span className="flex-1">{next.title}</span><Icon name="chev" className="size-5 shrink-0 text-ac" /></Link>}
      </nav>
      <FullNote source={getFullIndex().source} />
    </div>
  );
}
