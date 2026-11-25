import type { Metadata } from "next";
import { Clock, Compass, Repeat } from "lucide-react";
import { TopicPage } from "@/components/topic/TopicPage";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.namaz.title };

export default function NamazPage() {
  return (
    <TopicPage
      topic={TOPICS.namaz}
      tools={[
        { href: "/", title: "নামাজের সময়", hint: "আপনার শহরের আজকের সময়", icon: Clock },
        { href: "/qibla/", title: "কিবলা", hint: "দিক নির্ণয়", icon: Compass },
        { href: "/amal/after-salah/", title: "নামাজের পরের আমল", hint: "হাদিস ও আয়াত", icon: Repeat },
      ]}
    />
  );
}
