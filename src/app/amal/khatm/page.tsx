import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { KhatmTracker } from "@/components/tools/KhatmTracker";
import { getIndex, getSurah } from "@/lib/quran/server";

export const metadata: Metadata = { title: "খতম ও দৈনিক লক্ষ্য" };

export default function KhatmPage() {
  const { pages, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-md md:max-w-2xl">
      <ScreenHeader title="খতম ও লক্ষ্য" back={{ href: "/amal/", label: "দোয়া ও আমলে ফিরে যান" }} />
      <KhatmTracker starts={pages} paras={juzs.map((j) => ({ ...j, page: getSurah(j.s).ayahs[j.a - 1].page }))} />
    </div>
  );
}
