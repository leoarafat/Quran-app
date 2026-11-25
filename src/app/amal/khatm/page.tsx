import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { KhatmTracker } from "@/components/tools/KhatmTracker";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "খতম ও দৈনিক লক্ষ্য" };

export default function KhatmPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <PageHeader title="খতম ও দৈনিক লক্ষ্য" subtitle="নিজের তিলাওয়াতের হিসাব" />
      <KhatmTracker starts={getIndex().pages} />
    </div>
  );
}
