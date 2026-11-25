"use client";

import { toBnDigits } from "@/lib/bn";
import { playAyah, toggle, usePlayerValue, type Track } from "@/lib/audio/player";
import { byPage } from "@/lib/reader/prefs";
import type { Ayah } from "@/lib/quran/types";

const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function Verse({ ayah, track }: { ayah: Ayah; track: Track }) {
  const here = usePlayerValue((s) => s.track?.surah === track.surah && s.position.ayah === ayah.a);
  const sounding = usePlayerValue((s) => s.track?.surah === track.surah && s.position.ayah === ayah.a && (s.status === "playing" || s.status === "loading" || s.status === "waiting"));
  return (
    <>
      <span id={`a${ayah.a}`} data-ayah={ayah.a} className={`scroll-mt-28 rounded-lg ${here ? "bg-active" : ""}`}>{ayah.ar}</span>
      {" "}
      <button
        type="button"
        dir="rtl"
        onClick={() => (here ? toggle() : playAyah(track, ayah.a))}
        aria-label={`আয়াত ${toBnDigits(ayah.a)} ${sounding ? "থামান" : "শুনুন"}`}
        className={`mx-0.5 inline-grid size-9 place-items-center rounded-full border align-middle text-[0.9375rem] leading-none ${sounding ? "border-gold bg-gold text-on-gold" : "border-gold text-accent"}`}
      >
        {arabicDigits(ayah.a)}
      </button>
      {ayah.sajdah && <span className="mx-1 rounded-full bg-accent-soft px-2 align-middle font-sans text-xs text-accent">সিজদা</span>}
      {" "}
    </>
  );
}

/** Arabic only, running text, divided where the pages of the Madani mushaf divide. */
export function Mushaf({ ayahs, track }: { ayahs: Ayah[]; track: Track }) {
  return (
    <div className="space-y-4">
      {byPage(ayahs).map((group) => (
        <section key={group.page} aria-label={`পৃষ্ঠা ${toBnDigits(group.page)}`} className="rounded-[1.375rem] border border-line-strong bg-surface px-3 pb-2 pt-3">
          <p lang="ar" dir="rtl" className="text-justify font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[2.4] [text-align-last:center]">
            {group.ayahs.map((ayah) => <Verse key={ayah.a} ayah={ayah} track={track} />)}
          </p>
          <p className="mt-1 border-t border-line pt-1 text-center text-sm text-muted">পৃষ্ঠা {toBnDigits(group.page)} · পারা {toBnDigits(group.ayahs[0].juz)}</p>
        </section>
      ))}
      <p className="text-center text-[0.8125rem] leading-relaxed text-muted">পৃষ্ঠা ভাগ মদিনা মুসহাফ অনুযায়ী। লাইনের বিন্যাস ছাপা মুসহাফের মতো নয়। আয়াত নম্বরে চাপলে তিলাওয়াত শুনবেন।</p>
    </div>
  );
}
