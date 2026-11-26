import type { Metadata } from "next";
import { FastingTimes } from "@/components/tools/FastingTimes";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.ramadan.title };

export default function RamadanPage() {
  return <TopicPage topic={TOPICS.ramadan} lead={<FastingTimes />} />;
}
