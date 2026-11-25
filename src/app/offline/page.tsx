import type { Metadata } from "next";
import { OfflineCenter } from "@/components/offline/OfflineCenter";
import { PageHeader } from "@/components/PageHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "অফলাইন ও ডাউনলোড" };

export default function OfflinePage() {
  const { surahs, juzs } = getIndex();
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="অফলাইন ও ডাউনলোড" subtitle="ইন্টারনেট ছাড়াও ব্যবহার করুন" />
      <OfflineCenter surahs={surahs} juzs={juzs} />
    </div>
  );
}
