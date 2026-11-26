import type { Metadata } from "next";
import { OfflineCenter } from "@/components/offline/OfflineCenter";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "অফলাইন ও ডাউনলোড" };

export default function OfflinePage() {
  const { surahs, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-xl">
      <ScreenHeader title="অ্যাপ ইনস্টল ও অফলাইন" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <OfflineCenter surahs={surahs} juzs={juzs} />
    </div>
  );
}
