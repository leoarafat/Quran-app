import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FastLog } from "@/components/tools/FastLog";

export const metadata: Metadata = { title: "রোজার খাতা" };

export default function FastingPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl space-y-4">
      <PageHeader title="রোজার খাতা" subtitle="রমজান ও অন্য দিনের রোজার হিসাব" />
      <FastLog />
    </div>
  );
}
