"use client";

import { useRef, useState } from "react";
import { toBnDigits } from "@/lib/bn";
import type { LessonVideo } from "@/lib/videos";

const clock = (seconds: number) => toBnDigits(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);

export function LessonPlayer({ video }: { video: LessonVideo }) {
  const player = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  function jump(at: number) {
    const el = player.current;
    if (!el) return;
    // Before the file has loaded this sets the starting point, which play() then honours.
    el.currentTime = at;
    el.play().catch(() => {});
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <section aria-label={video.title} className="space-y-3 rounded-md border border-ln2 bg-sf p-3">
      <h2 className="px-1 font-display text-lg font-semibold leading-snug">ভিডিওতে শিখুন: {video.title}</h2>
      <video
        ref={player}
        controls
        playsInline
        preload="none"
        poster={video.poster}
        onPlay={() => setFailed(false)}
        className="mx-auto aspect-[4/5] max-h-[80vh] w-full max-w-md rounded-2xl bg-black"
      >
        <source src={video.url} type="video/mp4" onError={() => setFailed(true)} />
        আপনার ব্রাউজারে ভিডিও চলে না।
      </video>
      {failed && <p role="alert" className="px-1 text-sm text-gt">ভিডিও আনা যায়নি। ইন্টারনেট সংযোগ দেখে পাতাটি আবার খুলুন।</p>}
      <p className="px-1 text-sm text-ink2">
        দৈর্ঘ্য {clock(video.seconds)} · প্রায় {toBnDigits(Math.round(video.bytes / 1e6))} MB · বাংলা কণ্ঠ ও সাবটাইটেল · দেখতে ইন্টারনেট লাগে
      </p>
      <ul className="flex flex-wrap gap-2">
        {video.chapters.map((c) => (
          <li key={c.at}>
            <button type="button" onClick={() => jump(c.at)} className="min-h-11 rounded-full border border-ln2 px-3 text-sm font-semibold text-gt hover:border-ac">
              {c.title} · {clock(c.at)}
            </button>
          </li>
        ))}
      </ul>
      <p className="rounded-2xl border border-dashed border-ln2 px-3 py-2 text-sm leading-relaxed text-ink2">
        ভিডিওর মূল নিয়ম হানাফি পদ্ধতিতে; শেষে আহলে হাদিসদের প্রচলিত পদ্ধতির পার্থক্য বলা হয়েছে। বর্ণনা আমাদের লেখা, <strong className="text-ink">আলেমের যাচাই এখনো বাকি</strong>। কণ্ঠ কম্পিউটারে তৈরি, আরবি তিলাওয়াত শুদ্ধভাবে শিখতে ক্বারী বা আলেমের কাছে শুনে নিন।
      </p>
    </section>
  );
}
