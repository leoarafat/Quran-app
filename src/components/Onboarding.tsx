"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { findCities } from "@/components/tools/PlaceSheet";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Seg } from "@/components/ui/Seg";
import { toBnDigits } from "@/lib/bn";
import { needsOnboarding, ONBOARDED_KEY, PAGE_GOALS } from "@/lib/onboarding";
import { SCALE_MAX, SCALE_MIN, THEME_LABELS, THEMES } from "@/lib/settings";
import { EMPTY_KHATM, setGoal } from "@/lib/tools/khatm";
import { savePlace, usePlace } from "@/lib/usePlace";
import { updateSettings, useSettings } from "@/lib/useSettings";
import { writeStored } from "@/lib/useStored";

/** The welcome screen comes first; these steps wait until it is gone. */
function useWelcomeShowing() {
  return useSyncExternalStore(
    (listener) => {
      const watch = new MutationObserver(listener);
      watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-welcome"] });
      return () => watch.disconnect();
    },
    () => document.documentElement.dataset.welcome === "1",
    () => true,
  );
}

const main = "flex min-h-13 w-full items-center justify-center rounded-full bg-ac px-4 font-semibold text-on-ac";
const choice = "flex min-h-18 w-full items-center gap-3.5 rounded-md border border-ln bg-sf px-4 py-2 text-left shadow-card";

function PlaceStep({ next }: { next: () => void }) {
  const place = usePlace();
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState("");

  const locate = () => {
    if (!navigator.geolocation) return setMessage("এই ব্রাউজারে অবস্থান পাওয়া যায় না। শহর বেছে নিন।");
    setMessage("অবস্থান খোঁজা হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        savePlace({ id: "here", name: "আমার অবস্থান", lat: coords.latitude, lng: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        next();
      },
      () => setMessage("অবস্থান পাওয়া যায়নি। শহর বেছে নিন, না নিলে ঢাকার সময় দেখানো হবে।"),
      { timeout: 15000 },
    );
  };

  return (
    <>
      <div className="flex-1 space-y-3">
        <p className="text-ink2">আপনার অবস্থান জানলে নামাজের সময় ও কিবলা ঠিক হবে। অবস্থান শুধু এই ফোনেই থাকে।</p>
        <button type="button" className={choice} onClick={locate}><Icon name="pin" className="size-6 shrink-0 text-ac" /><span><b className="block">আমার অবস্থান</b><span className="text-[0.8125rem] text-ink2">শুধু এই ফোনে ব্যবহার হয়</span></span></button>
        <button type="button" className={choice} aria-expanded={picking} onClick={() => setPicking((v) => !v)}><Icon name="search" className="size-6 shrink-0 text-ac" /><span><b className="block">নিজে শহর বেছে নিন</b><span className="text-[0.8125rem] text-ink2">এখন: {place.name}</span></span></button>
        {picking && <div role="group" aria-label="শহর" className="grid grid-cols-3 gap-2">{findCities("").map((c) => <Chip key={c.id} aria-pressed={place.id === c.id} selected={place.id === c.id} onClick={() => savePlace(c)}>{c.name}</Chip>)}</div>}
        <p role="status" className="min-h-6 text-sm text-gt">{message}</p>
      </div>
      <button type="button" className={main} onClick={picking ? next : locate}>{picking ? "চালিয়ে যান" : "অবস্থান অনুমতি দিন"}</button>
    </>
  );
}

function LookStep({ sample, next }: { sample: { ar: string; bn: string }; next: () => void }) {
  const settings = useSettings();
  const step = (by: number) => {
    const clamp = (n: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round((n + by) * 10) / 10));
    updateSettings({ arScale: clamp(settings.arScale), bnScale: clamp(settings.bnScale) });
  };
  const round = "grid size-11 place-items-center rounded-full border border-ln2 text-ac disabled:opacity-35";
  return (
    <>
      <div className="flex-1 space-y-4">
        <p className="text-ink2">থিম ও লেখার আকার বেছে নিন। পরে সেটিংস থেকে বদলানো যাবে।</p>
        <div className="rounded-md border border-ln bg-sf p-4 shadow-card">
          <p lang="ar" dir="rtl" className="font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[2.25]">{sample.ar}</p>
          <p className="reading text-[calc(1rem*var(--bn-scale))]">{sample.bn}</p>
        </div>
        <Seg label="থিম" options={THEMES.map((t) => ({ value: t, text: THEME_LABELS[t] }))} value={settings.theme === "system" ? null : settings.theme} onChange={(theme) => updateSettings({ theme })} />
        <div className="flex items-center justify-between gap-3">
          <span>লেখার আকার</span>
          <span className="flex items-center gap-3">
            <button type="button" className={round} aria-label="লেখা ছোট করুন" disabled={settings.arScale <= SCALE_MIN} onClick={() => step(-0.1)}><Icon name="minus" className="size-5" /></button>
            <b className="w-14 text-center tabular-nums">{toBnDigits(Math.round(settings.arScale * 100))}%</b>
            <button type="button" className={round} aria-label="লেখা বড় করুন" disabled={settings.arScale >= SCALE_MAX} onClick={() => step(0.1)}><Icon name="plus" className="size-5" /></button>
          </span>
        </div>
      </div>
      <button type="button" className={main} onClick={next}>চালিয়ে যান</button>
    </>
  );
}

function GoalStep({ finish }: { finish: (goal: number | null) => void }) {
  const [goal, setChosen] = useState<number>(PAGE_GOALS[1]);
  return (
    <>
      <div className="flex-1 space-y-4">
        <p className="text-ink2">প্রতিদিন কত পৃষ্ঠা তিলাওয়াত করতে চান? ঐচ্ছিক, পরে বদলানো যাবে।</p>
        <div role="group" aria-label="দৈনিক লক্ষ্য" className="grid grid-cols-3 gap-3">
          {PAGE_GOALS.map((g) => <button key={g} type="button" aria-pressed={goal === g} onClick={() => setChosen(g)} className={`flex min-h-24 flex-col items-center justify-center rounded-md border bg-sf ${goal === g ? "border-ac ring-1 ring-ac" : "border-ln"}`}><b className="text-2xl tabular-nums">{toBnDigits(g)}</b><span className="text-[0.8125rem] text-ink2">পৃষ্ঠা/দিন</span></button>)}
        </div>
        <p className="text-[0.8125rem] text-ink2">পুরো কুরআন {toBnDigits(604)} পৃষ্ঠা। দিনে {toBnDigits(goal)} পৃষ্ঠা পড়লে {toBnDigits(Math.ceil(604 / goal))} দিনে এক খতম।</p>
      </div>
      <button type="button" className={main} onClick={() => finish(goal)}>শুরু করি</button>
    </>
  );
}

const TITLES = ["নামাজের সঠিক সময়ের জন্য", "আপনার পড়ার আরাম", "দৈনিক একটি ছোট লক্ষ্য"];

function Steps({ sample, onDone }: { sample: { ar: string; bn: string }; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  const finish = (goal: number | null) => {
    if (goal !== null) writeStored("noor.khatm.v1", JSON.stringify(setGoal(EMPTY_KHATM, goal)));
    writeStored(ONBOARDED_KEY, "1");
    onDone();
  };
  const next = () => setStep((s) => s + 1);

  return (
    // Escape counts as skipping the whole thing.
    <dialog ref={dialog} aria-labelledby="onboarding-title" onClose={() => finish(null)} className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-ink md:m-auto md:h-[44rem] md:max-h-[92dvh] md:max-w-md md:rounded-3xl md:border md:border-ln backdrop:bg-black/45">
      <div className="mx-auto flex h-full max-w-md flex-col gap-5 overflow-y-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+var(--safe-top))]">
        <div className="flex items-center justify-between">
          <p className="flex gap-1.5" aria-label={`ধাপ ${toBnDigits(step + 1)} / ${toBnDigits(3)}`}>{TITLES.map((t, i) => <span key={t} aria-hidden="true" className={`h-2 rounded-full ${i === step ? "w-6 bg-gd" : "w-2 bg-ln2"}`} />)}</p>
          <button type="button" className="min-h-11 px-2 font-medium" onClick={() => (step === 2 ? finish(null) : next())}>এড়িয়ে যান</button>
        </div>
        <h2 id="onboarding-title" aria-live="polite" className="font-display text-[1.75rem] font-bold leading-snug">{TITLES[step]}</h2>
        {step === 0 && <PlaceStep next={next} />}
        {step === 1 && <LookStep sample={sample} next={next} />}
        {step === 2 && <GoalStep finish={finish} />}
      </div>
    </dialog>
  );
}

const never = () => () => {};
const wanted = () => {
  try {
    return needsOnboarding(window.localStorage);
  } catch {
    // Storage blocked: the steps could not be remembered, so they are not shown.
    return false;
  }
};

export function Onboarding({ sample }: { sample: { ar: string; bn: string } }) {
  // Decided once, when the page opens: saving a choice in step one must not end the steps.
  const [due] = useState(() => (typeof window === "undefined" ? false : wanted()));
  const ready = useSyncExternalStore(never, () => true, () => false);
  const welcome = useWelcomeShowing();
  const [done, setDone] = useState(false);
  if (!ready || !due || done || welcome) return null;
  return <Steps sample={sample} onDone={() => setDone(true)} />;
}
