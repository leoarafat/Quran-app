import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { MyPage } from "@/components/tools/MyPage";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "আমার পাতা" };

export default function MePage() {
  return (
    <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
      <ScreenHeader title="আমার পাতা" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <MyPage names={getIndex().surahs.map((s) => s.bangla)} />
    </div>
  );
}
