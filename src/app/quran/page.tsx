import type { Metadata } from "next";
import { ContinueReading } from "@/components/quran/ContinueReading";
import { SurahBrowser } from "@/components/quran/SurahBrowser";
import { PageHeader } from "@/components/PageHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন" };

export default function QuranPage() {
  const { surahs, juzs, sajdas } = getIndex();
  return (
    <div className="space-y-4">
      <PageHeader title="আল-কুরআন" subtitle="১১৪টি সূরা, অনুবাদ ও তিলাওয়াতসহ" />
      <ContinueReading names={surahs.map((s) => s.bangla)} />
      <SurahBrowser surahs={surahs} juzs={juzs} sajdas={sajdas} />
    </div>
  );
}
