import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { DataManager } from "@/components/tools/DataManager";

export const metadata: Metadata = { title: "আমার ডেটা" };

export default function DataPage() {
  return (
    <div className="mx-auto max-w-md md:max-w-2xl">
      <ScreenHeader title="আমার ডেটা" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <DataManager />
    </div>
  );
}
