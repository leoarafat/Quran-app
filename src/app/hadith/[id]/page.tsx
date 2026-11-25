import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { HadithBookmarkButton } from "@/components/hadith/HadithBookmarkButton";
import { ShareHadith } from "@/components/hadith/ShareHadith";
import { SourceNote } from "@/components/hadith/SourceNote";
import { toBnDigits } from "@/lib/bn";
import { getHadith, getHadithIndex } from "@/lib/hadith/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getHadithIndex().index.titles).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/[id]">): Promise<Metadata> {
  const { id } = await params;
  const entry = getHadithIndex().index.titles[id];
  return entry ? { title: entry[0].slice(0, 70), description: entry[0] } : {};
}

export default async function HadithDetailPage({ params }: PageProps<"/hadith/[id]">) {
  const { id } = await params;
  const { index, categories } = getHadithIndex();
  if (!index.titles[id]) notFound();
  const h = getHadith(Number(id));
  const bukhari = h.bukhari?.map((n) => toBnDigits(n)).join(", ");
  const share = `${h.hadeeth}\n\nমান: ${h.grade}\nবর্ণনা: ${h.attribution}\nউৎস: ${index.meta.publisher} (ফাইলের তারিখ ${index.meta.fileDate})`;
  const card = "rounded-[1.375rem] border border-line bg-surface p-4";

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href={h.categories[0] ? `/hadith/c/${h.categories[0]}/` : "/hadith/"} className="inline-flex min-h-11 min-w-0 items-center gap-1 text-accent">
          <ChevronLeft aria-hidden className="size-5 shrink-0" /> <span className="line-clamp-2">{categories.get(h.categories[0])?.title ?? "হাদিস"}</span>
        </Link>
        <HadithBookmarkButton id={h.id} />
      </div>
      <h1 className="font-display text-xl font-semibold leading-relaxed">{h.title}</h1>

      <div className={card}>
        <p lang="ar" dir="rtl" className="whitespace-pre-line font-arabic text-[calc(1.5rem*var(--ar-scale))] leading-[2.3]">{h.arabic}</p>
      </div>
      <p className="whitespace-pre-line text-[calc(1.0625rem*var(--bn-scale))] leading-[1.9]">{h.hadeeth}</p>

      <dl className={`${card} space-y-2`}>
        <div className="flex items-start gap-2"><dt className="shrink-0 text-muted">মান:</dt><dd className="flex min-w-0 flex-wrap items-center gap-2"><GradeBadge cls={h.gradeClass} />{!["সহীহ", "হাসান"].includes(h.grade.trim()) && <span>{h.grade}</span>}</dd></div>
        <div className="flex items-start gap-2"><dt className="shrink-0 text-muted">বর্ণনা:</dt><dd className="min-w-0 whitespace-pre-line">{h.attribution}</dd></div>
        {bukhari && (
          <div className="flex items-start gap-2"><dt className="shrink-0 text-muted">নম্বর:</dt><dd>বুখারী {bukhari} <span className="block text-[0.8125rem] text-muted">যন্ত্রে মিলিয়ে পাওয়া; ছাপা কিতাবে মিলিয়ে নিন।</span></dd></div>
        )}
      </dl>

      <section className={card}>
        <h2 className="mb-1 font-display font-semibold text-accent">ব্যাখ্যা</h2>
        <p className="whitespace-pre-line leading-[1.9] text-soft">{h.explanation}</p>
      </section>

      {h.hints.length > 0 && (
        <section className={card}>
          <h2 className="mb-2 font-display font-semibold text-accent">এ হাদিস থেকে শিক্ষা</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-soft">{h.hints.map((hint, i) => <li key={i}>{hint}</li>)}</ul>
        </section>
      )}

      <ShareHadith text={share} />

      <nav aria-label="সম্পর্কিত বিষয়" className="flex flex-wrap gap-2">
        {h.categories.map((c) => <Link key={c} href={`/hadith/c/${c}/`} prefetch={false} className="flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm">{categories.get(c)!.title}</Link>)}
      </nav>
      <SourceNote meta={index.meta} />
    </article>
  );
}
