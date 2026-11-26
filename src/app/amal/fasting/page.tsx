import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { FastLog } from "@/components/tools/FastLog";

export const metadata: Metadata = { title: "রোজার খাতা" };

export default function FastingPage() {
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl space-y-4">
      <ScreenHeader title="রোজার খাতা" back={{ href: "/amal/", label: "দোয়া ও আমলে ফিরে যান" }} />
      <FastLog />
    </div>
  );
}
