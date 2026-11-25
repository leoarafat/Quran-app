import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SearchExperience } from "@/components/search/SearchExperience";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "সার্চ" };

export default function SearchPage() {
  const { surahs, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <PageHeader title="সার্চ" subtitle="কুরআনের আয়াত ও হাদিস" />
      <SearchExperience surahs={surahs} juzs={juzs} />
    </div>
  );
}
