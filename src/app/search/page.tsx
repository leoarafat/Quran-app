import type { Metadata } from "next";
import { SearchExperience } from "@/components/search/SearchExperience";
import { ScreenHeader, SettingsLink } from "@/components/shell/ScreenHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "খুঁজুন" };

export default function SearchPage() {
  const { surahs, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-2xl lg:max-w-3xl">
      <ScreenHeader title="খুঁজুন"><SettingsLink /></ScreenHeader>
      <SearchExperience surahs={surahs} juzs={juzs} />
    </div>
  );
}
