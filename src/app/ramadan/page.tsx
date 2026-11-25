import type { Metadata } from "next";
import { BookCheck, CalendarDays, NotebookPen } from "lucide-react";
import { FastingTimes } from "@/components/tools/FastingTimes";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.ramadan.title };

export default function RamadanPage() {
  return (
    <TopicPage topic={TOPICS.ramadan} tools={[{ href: "/amal/fasting/", title: "রোজার খাতা", hint: "কোন দিন রোজা রাখলেন", icon: NotebookPen }, { href: "/amal/khatm/", title: "রমজানের খতম", hint: "দৈনিক পৃষ্ঠার লক্ষ্য ও অগ্রগতি", icon: BookCheck }, { href: "/calendar/", title: "হিজরি ক্যালেন্ডার", hint: "রমজান ও ঈদের তারিখ (আনুমানিক)", icon: CalendarDays }]}>
      <FastingTimes />
    </TopicPage>
  );
}
