import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PendingNote } from "@/components/PendingNote";
import { TopicSources } from "@/components/topic/TopicSources";
import { ZakatCalculator } from "@/components/tools/ZakatCalculator";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: "যাকাত হিসাব" };

export default function ZakatPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="যাকাত হিসাব" subtitle="আপনার লেখা সংখ্যা কোথাও পাঠানো বা সেভ করা হয় না" />
      <PendingNote
        title="আলেমের যাচাই বাকি"
        items={[
          "নিসাব (৭.৫ ভরি সোনা বা ৫২.৫ ভরি রুপা), হার ২.৫% এবং ১ ভরি = ১১.৬৬৪ গ্রাম ধরে হিসাব করা হয়েছে। এগুলো প্রচলিত হিসাব, আমাদের আলেম এখনো যাচাই করেননি।",
          "ব্যবহারের গয়না, নানা রকম সম্পদ মিলিয়ে নিসাব, দেনা কতটা বাদ যাবে, এক চান্দ্র বছর পূর্ণ হওয়া ইত্যাদিতে নিয়ম ও মতভেদ আছে।",
          "ফসল ও গবাদি পশুর যাকাত এই হিসাবে নেই।",
        ]}
      />
      <ZakatCalculator />
      <TopicSources topic={TOPICS.zakat} />
    </div>
  );
}
