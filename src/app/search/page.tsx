import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SearchExperience } from "@/components/search/SearchExperience";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "সার্চ" };

export default function SearchPage() {
  const { surahs, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="সার্চ" subtitle="কুরআনের অর্থ, উচ্চারণ, আরবি, সূরা ও আয়াত" />
      <SearchExperience surahs={surahs} juzs={juzs} />
    </div>
  );
}
