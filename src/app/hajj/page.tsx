import type { Metadata } from "next";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.hajj.title };

export default function HajjPage() {
  return <TopicPage topic={TOPICS.hajj} tools={[{ href: "/quran/22/", title: "সূরা আল-হাজ্জ", hint: "পুরো সূরা পড়ুন ও শুনুন", icon: "quran" }]} />;
}
