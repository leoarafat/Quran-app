import type { Metadata } from "next";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.afterSalah.title };

export default function AfterSalahPage() {
  return (
    <TopicPage
      topic={TOPICS.afterSalah}
      back={{ href: "/amal/", label: "দোয়া ও আমলে ফিরে যান" }}
      tools={[
        { href: "/tasbih/", title: "তাসবিহ", hint: "যিকির গুনুন", icon: "tasbih" },
        { href: "/amal/daily/", title: "আমার আমলের খাতা", hint: "পাঁচ ওয়াক্ত ও নিজের আমল টিক দিন", icon: "deeds" },
      ]}
    />
  );
}
