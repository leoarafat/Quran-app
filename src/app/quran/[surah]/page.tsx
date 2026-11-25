import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/quran/Reader";
import { getIndex, getSurah } from "@/lib/quran/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return getIndex().surahs.map((s) => ({ surah: String(s.n) }));
}

export async function generateMetadata({ params }: PageProps<"/quran/[surah]">): Promise<Metadata> {
  const { surah } = await params;
  const info = getIndex().surahs[Number(surah) - 1];
  return info ? { title: `সূরা ${info.bangla}`, description: `সূরা ${info.bangla}: আরবি, বাংলা উচ্চারণ, অনুবাদ ও তিলাওয়াত` } : {};
}

export default async function SurahPage({ params }: PageProps<"/quran/[surah]">) {
  const { surah } = await params;
  const { surahs, sources } = getIndex();
  const info = surahs[Number(surah) - 1];
  if (!info) notFound();
  const credit = `অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র (QuranEnc.com v${sources.translation.version}) · আরবি: Tanzil.net`;

  return <Reader key={info.n} data={getSurah(info.n)} surahs={surahs} credit={credit} />;
}
