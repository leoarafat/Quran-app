import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryLinks } from "@/components/hadith/CategoryLinks";
import { HadithList } from "@/components/hadith/HadithList";
import { SourceNote } from "@/components/hadith/SourceNote";
import { PageHeader } from "@/components/PageHeader";
import { LessonPlayer } from "@/components/video/LessonPlayer";
import { categoryPath, getHadithIndex } from "@/lib/hadith/server";
import { videoFor } from "@/lib/videos";

export const dynamicParams = false;

export function generateStaticParams() {
  return getHadithIndex().index.categories.map((c) => ({ id: String(c.id) }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/c/[id]">): Promise<Metadata> {
  const category = getHadithIndex().categories.get(Number((await params).id));
  return category ? { title: category.title } : {};
}

export default async function CategoryPage({ params }: PageProps<"/hadith/c/[id]">) {
  const { index, categories } = getHadithIndex();
  const category = categories.get(Number((await params).id));
  if (!category) notFound();
  const trail = categoryPath(category.id).slice(0, -1);
  const video = videoFor(category.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <nav aria-label="বিষয়ের পথ" className="flex flex-wrap items-center gap-x-2 text-sm">
        <Link href="/hadith/" className="inline-flex min-h-11 items-center text-accent underline">হাদিস</Link>
        {trail.map((c) => <span key={c.id} className="flex items-center gap-2"><span aria-hidden>›</span><Link href={`/hadith/c/${c.id}/`} className="inline-flex min-h-11 items-center text-accent underline">{c.title}</Link></span>)}
      </nav>
      <PageHeader title={category.title} />
      {video && <LessonPlayer video={video} />}
      {category.children.length > 0 && <CategoryLinks categories={category.children.map((id) => categories.get(id)!)} />}
      {category.hadiths.length > 0 && <HadithList key={category.id} items={category.hadiths.map((id) => ({ id, title: index.titles[id][0], grade: index.titles[id][1] }))} />}
      <SourceNote meta={index.meta} />
    </div>
  );
}
