import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "নামাজ শিক্ষা" };

export default function NamazPage() {
  return (
    <>
      <PageHeader title="নামাজ শিক্ষা" />
      <ComingSoon>দুই পদ্ধতিতে (হানাফি ও সহিহ হাদিসভিত্তিক) ধাপে ধাপে নামাজ শিক্ষা আলেম যাচাইয়ের পর প্রকাশ হবে।</ComingSoon>
    </>
  );
}
