import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlay, Clock, Compass, Repeat } from "lucide-react";
import { TopicPage } from "@/components/topic/TopicPage";
import { toBnDigits } from "@/lib/bn";
import { LESSONS, lessonPath, REVIEW_NOTICE } from "@/lib/namaz";
import { TOPICS } from "@/lib/topics";
import { VIDEOS } from "@/lib/videos";

export const metadata: Metadata = { title: TOPICS.namaz.title };

export default function NamazPage() {
  return (
    <TopicPage
      topic={TOPICS.namaz}
      lead={
        <section aria-labelledby="lessons" className="space-y-2">
          <h2 id="lessons" className="font-display text-lg font-semibold">ধাপে ধাপে নামাজ শিখুন</h2>
          <p className="text-sm leading-relaxed text-muted">ওপর থেকে নিচে ক্রমানুসারে পড়ুন। {REVIEW_NOTICE}</p>
          <ol className="grid gap-2 lg:grid-cols-2">
            {LESSONS.map((lesson, i) => (
              <li key={lesson.slug}>
                <Link href={lessonPath(lesson.slug)} className="flex min-h-16 items-center gap-3 rounded-[1.375rem] border border-line-strong bg-surface px-4 py-2 hover:border-brand">
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong font-semibold text-accent">{toBnDigits(i + 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold leading-snug">{lesson.title}</span>
                    <span className="block text-sm text-muted">{lesson.hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      }
      tools={[
        ...VIDEOS.map((v) => ({ href: `/hadith/c/${v.category}/`, title: v.title, hint: "বাংলা ভিডিও, সাবটাইটেলসহ", icon: CirclePlay })),
        { href: "/", title: "নামাজের সময়", hint: "আপনার শহরের আজকের সময়", icon: Clock },
        { href: "/qibla/", title: "কিবলা", hint: "দিক নির্ণয়", icon: Compass },
        { href: "/amal/after-salah/", title: "নামাজের পরের আমল", hint: "হাদিস ও আয়াত", icon: Repeat },
      ]}
    />
  );
}
