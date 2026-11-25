import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { DataManager } from "@/components/tools/DataManager";

export const metadata: Metadata = { title: "আমার ডেটা" };

export default function DataPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl space-y-4">
      <PageHeader title="আমার ডেটা" subtitle="ব্যাকআপ, রিস্টোর ও মুছে ফেলা" />
      <DataManager />
    </div>
  );
}
