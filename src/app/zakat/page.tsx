import type { Metadata } from "next";
import { PendingNote } from "@/components/PendingNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { TopicSources } from "@/components/topic/TopicSources";
import { ZakatCalculator } from "@/components/tools/ZakatCalculator";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: "যাকাত হিসাব" };

export default function ZakatPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ScreenHeader title="যাকাত হিসাব" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <div className="space-y-5">
        <p className="text-[0.9375rem] text-ink2">আপনার লেখা সংখ্যা কোথাও পাঠানো বা সেভ করা হয় না।</p>
        <ZakatCalculator />
        <PendingNote
          title="আলেমের যাচাই বাকি"
          items={[
            "নিসাব (৭.৫ ভরি সোনা বা ৫২.৫ ভরি রুপা), হার ২.৫% এবং ১ ভরি = ১১.৬৬৪ গ্রাম ধরে হিসাব করা হয়েছে। এগুলো প্রচলিত হিসাব, আমাদের আলেম এখনো যাচাই করেননি।",
            "ব্যবহারের গয়না, নানা রকম সম্পদ মিলিয়ে নিসাব, দেনা কতটা বাদ যাবে, এক চান্দ্র বছর পূর্ণ হওয়া ইত্যাদিতে নিয়ম ও মতভেদ আছে।",
            "ফসল ও গবাদি পশুর যাকাত এই হিসাবে নেই।",
          ]}
        />
        <TopicSources topic={TOPICS.zakat} />
      </div>
    </div>
  );
}
