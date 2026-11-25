import type { Metadata } from "next";
import { CircleDot, ListChecks } from "lucide-react";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.afterSalah.title };

export default function AfterSalahPage() {
  return (
    <TopicPage
      topic={TOPICS.afterSalah}
      tools={[
        { href: "/tasbih/", title: "তাসবিহ", hint: "যিকির গুনুন", icon: CircleDot },
        { href: "/amal/daily/", title: "আমার আমলের খাতা", hint: "পাঁচ ওয়াক্ত ও নিজের আমল টিক দিন", icon: ListChecks },
      ]}
    />
  );
}
