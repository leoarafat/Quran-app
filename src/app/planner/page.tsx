import type { Metadata } from "next";
import { Planner } from "@/components/planner/Planner";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন প্ল্যানার", description: "দিন ভাগ করে কুরআন পড়ার পরিকল্পনা" };

export default function PlannerPage() {
  const { surahs, pages, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-md md:max-w-2xl">
      <ScreenHeader title="কুরআন প্ল্যানার" back={{ href: "/", label: "হোমে ফিরে যান" }} />
      <Planner layout={{ counts: surahs.map((s) => s.ayahs), pages, juzs }} names={surahs.map((s) => s.bangla)} />
    </div>
  );
}
