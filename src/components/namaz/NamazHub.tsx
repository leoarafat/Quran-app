"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { LearnedMark } from "@/components/Learned";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { STAGES } from "@/lib/namaz/stages";

export type HubLesson = { href: string; title: string; hint: string; badge?: string };

const TABS = [["lessons", "পাঠ", "ধাপে ধাপে পাঠ"], ["hadith", "হাদিস", "হাদিস"], ["ayat", "আয়াত", "কুরআনের আয়াত"]] as const;
type Tab = (typeof TABS)[number][0];

/** The open tab lives in the address (#hadith, #ayat), so links and the back button work. */
const onHash = (listener: () => void) => { window.addEventListener("hashchange", listener); return () => window.removeEventListener("hashchange", listener); };
const useTab = (): Tab => {
  const hash = useSyncExternalStore(onHash, () => window.location.hash.slice(1), () => "");
  return TABS.find(([id]) => id === hash)?.[0] ?? "lessons";
};
const open = (tab: Tab) => {
  history.replaceState(null, "", tab === "lessons" ? window.location.pathname : `#${tab}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};

export function NamazHub({ lessons, notice, hadith, ayat, aside }: { lessons: HubLesson[]; notice: string; hadith: React.ReactNode; ayat: React.ReactNode; aside: React.ReactNode }) {
  const tab = useTab();
  const [stage, setStage] = useState(0);
  const starts = STAGES.map((_, i) => STAGES.slice(0, i).reduce((n, s) => n + s.count, 0));
  const square = "grid size-11 place-items-center rounded-[0.875rem] bg-hero-tile";

  const tabs = (phone: boolean) => (
    <div role="group" aria-label="নামাজ শিক্ষার অংশ" className={phone ? "grid grid-cols-3 gap-1 rounded-2xl bg-hero-tile p-1 md:hidden" : "hidden flex-wrap gap-1.5 rounded-[0.875rem] bg-ln p-[0.3125rem] md:flex"}>
      {TABS.map(([id, short, long]) => (
        <button key={id} type="button" aria-pressed={tab === id} onClick={() => open(id)}
          className={`min-h-11 rounded-xl text-[0.9375rem] font-semibold md:min-h-11.5 md:flex-1 md:basis-36 md:rounded-[0.625rem] ${tab === id ? "bg-white text-[#0f4c3a] shadow-card md:bg-ac md:text-on-ac" : "text-on-hero md:text-ink2 md:hover:bg-sf md:hover:text-ink"}`}>
          {phone ? short : `${long}${id === "lessons" ? ` (${toBnDigits(lessons.length)})` : ""}`}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Phones: one coloured block with its own back and search buttons. Wider screens: a banner. */}
      <header className="on-deep flex flex-col gap-3.5 bg-hero text-on-hero max-md:-mx-4 max-md:-mt-6 max-md:rounded-b-[1.75rem] max-md:px-5 max-md:pb-5.5 max-md:pt-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:rounded-[1.75rem] md:p-8">
        <div className="flex items-center justify-between md:hidden">
          <Link href="/" aria-label="হোমে ফিরুন" className={square}><Icon name="back" className="size-5" /></Link>
          <Link href="/search/" aria-label="খুঁজুন" className={square}><Icon name="search" className="size-5" /></Link>
        </div>
        <div>
          <h1 className="font-display text-[2rem] font-bold leading-snug md:text-[2.5rem]">নামাজ শিক্ষা</h1>
          <p className="text-hero-muted md:text-[1.0625rem]">ধাপে ধাপে পাঠ, ভিডিও, হাদিস ও আয়াত</p>
        </div>
        {lessons[0] && <Link href={lessons[0].href} className="hidden min-h-12 items-center rounded-[0.875rem] bg-gold px-6 font-semibold text-on-gold md:flex">পাঠ ১ থেকে শুরু করুন</Link>}
        {tabs(true)}
      </header>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6">
        <div className="min-w-0 flex-1 space-y-4 md:space-y-5">
          {tabs(false)}

          <div hidden={tab !== "lessons"} className="space-y-3.5 md:space-y-7">
            <div role="group" aria-label="পাঠের ধাপ" className="rail -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
              {STAGES.map((s, i) => <button key={s.chip} type="button" aria-pressed={stage === i} onClick={() => setStage(i)} className={`min-h-11 shrink-0 rounded-full border px-4.5 text-sm font-semibold ${stage === i ? "border-ac bg-ac text-on-ac" : "border-ln2 bg-sf"}`}>{s.chip}</button>)}
            </div>
            <p className="leading-relaxed text-ink2 max-md:hidden">ওপর থেকে নিচে ক্রমানুসারে পড়ুন। {notice}</p>
            {STAGES.map((s, i) => (
              <section key={s.title} aria-labelledby={`stage-${i}`} className={`space-y-3 ${stage === i ? "" : "max-md:hidden"}`}>
                <div className="flex items-baseline gap-3 max-md:justify-between">
                  <h2 id={`stage-${i}`} className="font-display text-xl font-bold">{s.title}</h2>
                  <span className="text-[0.8125rem] text-ink2">পাঠ {toBnDigits(starts[i] + 1)}–{toBnDigits(starts[i] + s.count)}</span>
                </div>
                <ol className="grid gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] md:gap-3">
                  {lessons.slice(starts[i], starts[i] + s.count).map((l, j) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex h-full min-h-19 items-center gap-3.5 rounded-[1.125rem] border border-ln bg-sf p-3.5 hover:border-ac md:min-h-20 md:p-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-[0.875rem] bg-tint text-[1.0625rem] font-semibold text-on-tint">{toBnDigits(starts[i] + j + 1)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2">
                            <span className="text-base font-semibold leading-normal">{l.title}</span>
                            {l.badge && <span className="rounded-full bg-gold-soft px-2 text-[0.6875rem] font-semibold leading-5 text-on-gold-soft">{l.badge}</span>}
                          </span>
                          <span className="block text-[0.8125rem] leading-snug text-ink2">{l.hint}</span>
                        </span>
                        <LearnedMark href={l.href} />
                        <Icon name="chev" className="size-4 shrink-0 text-ink2 max-md:hidden" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {stage < STAGES.length - 1 && <button type="button" onClick={() => { setStage(stage + 1); window.scrollTo({ top: 0 }); }} className="min-h-12.5 w-full rounded-2xl bg-ac text-[0.9375rem] font-semibold text-on-ac md:hidden">পরের ধাপ</button>}
            <p className="text-[0.8125rem] leading-relaxed text-ink2 md:hidden">ওপর থেকে নিচে ক্রমানুসারে পড়ুন। {notice}</p>
          </div>

          <div hidden={tab !== "hadith"}>{hadith}</div>
          <div hidden={tab !== "ayat"}>{ayat}</div>
        </div>

        <div className="space-y-4 xl:w-[20rem] xl:shrink-0">{aside}</div>
      </div>
    </div>
  );
}
