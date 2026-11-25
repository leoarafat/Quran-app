"use client";

import { AyahOrnament } from "@/components/ui/AyahOrnament";
import { playAyah, toggle, type Track } from "@/lib/audio/player";
import { toBnDigits } from "@/lib/bn";
import { byPage } from "@/lib/reader/prefs";
import type { Ayah } from "@/lib/quran/types";
import { useAyahAudio } from "./AyahCard";

function Verse({ ayah, track, onOpen }: { ayah: Ayah; track: Track; onOpen: (a: number) => void }) {
  const { here, sounding } = useAyahAudio(track.surah, ayah.a);
  const open = () => { if (!window.getSelection()?.toString()) onOpen(ayah.a); };
  return (
    <>
      <span
        id={`a${ayah.a}`}
        data-ayah={ayah.a}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        className={`cursor-pointer scroll-mt-28 rounded-lg ${here ? "bg-gs" : ""}`}
      >
        {ayah.ar}
      </span>
      {" "}
      <button
        type="button"
        onClick={() => (here ? toggle() : playAyah(track, ayah.a))}
        aria-label={`আয়াত ${toBnDigits(ayah.a)} ${sounding ? "থামান" : "শুনুন"}`}
        className={`inline-grid size-11 place-items-center rounded-full align-middle leading-none ${sounding ? "bg-gs" : ""}`}
      >
        <AyahOrnament label={toBnDigits(ayah.a)} />
      </button>
      {ayah.sajdah && <span className="mx-1 rounded-full border border-gd px-2 align-middle font-sans text-xs text-gt">সিজদা</span>}
      {" "}
    </>
  );
}

/** Arabic only, running text, divided where the pages of the Madani mushaf divide. */
export function Mushaf({ ayahs, track, onOpen }: { ayahs: Ayah[]; track: Track; onOpen: (a: number) => void }) {
  return (
    <div className="space-y-4">
      {byPage(ayahs).map((group) => (
        <section key={group.page} aria-label={`পৃষ্ঠা ${toBnDigits(group.page)}`} className="rounded-[1.25rem] border border-ln bg-sf p-1.5">
          <div className="rounded-md border border-gd/45 px-3 pb-2 pt-2">
            <p lang="ar" dir="rtl" className="text-justify font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[calc(var(--ar-lh,2.25)+0.15)] [text-align-last:center]">
              {group.ayahs.map((ayah) => <Verse key={ayah.a} ayah={ayah} track={track} onOpen={onOpen} />)}
            </p>
            <p className="mt-1 border-t border-ln pt-1 text-center text-[0.8125rem] text-ink2">পৃষ্ঠা {toBnDigits(group.page)} · পারা {toBnDigits(group.ayahs[0].juz)} · ৬০৪ পৃষ্ঠার মধ্যে</p>
          </div>
        </section>
      ))}
      <p className="text-center text-[0.8125rem] leading-relaxed text-ink2">পৃষ্ঠা ভাগ মদিনা মুসহাফ অনুযায়ী। লাইনের বিন্যাস ছাপা মুসহাফের মতো নয়। আয়াতে চাপলে অনুবাদ খুলবে, নম্বরে চাপলে তিলাওয়াত শুনবেন।</p>
    </div>
  );
}
