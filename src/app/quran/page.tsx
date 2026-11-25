import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { ContinueReading } from "@/components/quran/ContinueReading";
import { SurahBrowser } from "@/components/quran/SurahBrowser";
import { PageHeader } from "@/components/PageHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন" };

export default function QuranPage() {
  const { surahs, juzs, sajdas, pages, rukus, hizbs, manzils } = getIndex();
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="আল-কুরআন" subtitle="১১৪টি সূরা, অনুবাদ ও তিলাওয়াতসহ" />
        <Link href="/bookmarks/" aria-label="বুকমার্ক" className="grid size-[2.875rem] shrink-0 place-items-center rounded-full border border-line bg-surface text-accent">
          <BookMarked aria-hidden className="size-[1.3125rem]" strokeWidth={1.8} />
        </Link>
      </div>
      <ContinueReading names={surahs.map((s) => s.bangla)} />
      <SurahBrowser surahs={surahs} juzs={juzs} sajdas={sajdas} pages={pages} rukus={rukus} hizbs={hizbs} manzils={manzils} />
    </div>
  );
}
