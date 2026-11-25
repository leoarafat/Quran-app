import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "আমল" };

export default function AmalPage() {
  return (
    <>
      <PageHeader title="আমল" />
      <ComingSoon>প্রতিটি আমল রেফারেন্স ও যাচাইয়ের পর প্রকাশ করা হবে।</ComingSoon>
    </>
  );
}
