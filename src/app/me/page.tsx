import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MyPage } from "@/components/tools/MyPage";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "আমার পাতা" };

export default function MePage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <PageHeader title="আমার পাতা" subtitle="আপনার আমল ও পড়ার অগ্রগতি" />
      <MyPage names={getIndex().surahs.map((s) => s.bangla)} />
    </div>
  );
}
