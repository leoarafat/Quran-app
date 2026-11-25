import type { Metadata } from "next";
import { CirclePlay, Clock, Compass, Repeat } from "lucide-react";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";
import { VIDEOS } from "@/lib/videos";

export const metadata: Metadata = { title: TOPICS.namaz.title };

export default function NamazPage() {
  return (
    <TopicPage
      topic={TOPICS.namaz}
      tools={[
        ...VIDEOS.map((v) => ({ href: `/hadith/c/${v.category}/`, title: v.title, hint: "বাংলা ভিডিও, সাবটাইটেলসহ", icon: CirclePlay })),
        { href: "/", title: "নামাজের সময়", hint: "আপনার শহরের আজকের সময়", icon: Clock },
        { href: "/qibla/", title: "কিবলা", hint: "দিক নির্ণয়", icon: Compass },
        { href: "/amal/after-salah/", title: "নামাজের পরের আমল", hint: "হাদিস ও আয়াত", icon: Repeat },
      ]}
    />
  );
}
