import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reader } from "@/components/quran/Reader";
import { toBnDigits } from "@/lib/bn";
import { getIndex, getSurah } from "@/lib/quran/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return getIndex().surahs.map((s) => ({ surah: String(s.n) }));
}

export async function generateMetadata({ params }: PageProps<"/quran/[surah]">): Promise<Metadata> {
  const { surah } = await params;
  const info = getIndex().surahs[Number(surah) - 1];
  return info ? { title: `সূরা ${info.bangla}`, description: `সূরা ${info.bangla}: আরবি, বাংলা অনুবাদ ও তিলাওয়াত` } : {};
}

export default async function SurahPage({ params }: PageProps<"/quran/[surah]">) {
  const { surah } = await params;
  const { surahs, sources } = getIndex();
  const info = surahs[Number(surah) - 1];
  if (!info) notFound();
  const previous = surahs[info.n - 2];
  const next = surahs[info.n];
  const credit = `অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র (QuranEnc.com v${sources.translation.version}) · আরবি: Tanzil.net`;
  const nav = "flex min-h-14 flex-1 items-center gap-2 rounded-2xl border border-line bg-surface px-3 font-semibold hover:border-brand";

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-3 rounded-3xl bg-hero p-5 text-center text-on-hero">
        <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-[1.8]">{info.arabic}</p>
        <h1 className="text-2xl font-bold">সূরা {info.bangla}</h1>
        <p className="text-on-hero/85">সূরা {toBnDigits(info.n)} · {info.revelation === "meccan" ? "মাক্কি" : "মাদানি"} · {toBnDigits(info.ayahs)} আয়াত</p>
      </header>

      <Reader key={info.n} data={getSurah(info.n)} surahName={info.bangla} credit={credit} />

      <nav aria-label="অন্য সূরা" className="mt-5 flex gap-3">
        {previous ? <Link href={`/quran/${previous.n}/`} className={nav}><ChevronLeft aria-hidden className="size-5" /><span className="truncate">{previous.bangla}</span></Link> : <span className="flex-1" />}
        {next ? <Link href={`/quran/${next.n}/`} className={`${nav} justify-end`}><span className="truncate">{next.bangla}</span><ChevronRight aria-hidden className="size-5" /></Link> : <span className="flex-1" />}
      </nav>
      <p className="mt-4 text-center text-sm text-muted">{credit} · <Link href="/about/" className="underline">উৎস ও শর্ত</Link></p>
    </article>
  );
}
