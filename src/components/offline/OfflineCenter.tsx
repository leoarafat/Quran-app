"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Check, Download, Headphones, Smartphone, Square, Trash2 } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { RECITERS } from "@/lib/audio/reciters";
import { AUDIO_CACHE, parseSaved, removableUrls, saveAll, SAVED_KEY, savedId, urlsOf, type Progress, type Saved, type Unit } from "@/lib/offline/audio";
import { install, usePwa } from "@/lib/offline/pwa";
import type { Place, SurahInfo } from "@/lib/quran/types";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const QURAN_CACHE = "noor-quran-offline";
const chip = (on: boolean) => `min-h-11 rounded-full border px-4 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;
const primary = "flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 font-semibold text-on-gold disabled:opacity-50";
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const select = "min-h-12 w-full rounded-2xl border border-line-strong bg-bg px-3 text-text";
const mb = (bytes: number) => `${toBnDigits((bytes / 1e6).toFixed(1))} MB`;

function explain(error: unknown): string {
  const name = (error as Error)?.name;
  if (name === "AbortError") return "থামানো হয়েছে। যতটুকু নেমেছে তা রাখা আছে; আবার চাপলে বাকিটা নামবে।";
  if (name === "QuotaExceededError") return "ফোনে আর জায়গা নেই। কিছু ফাঁকা করে আবার চেষ্টা করুন।";
  return "নামানো সম্পূর্ণ হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন; যতটুকু নেমেছে তা রাখা আছে।";
}

function Bar({ progress, label }: { progress: Progress; label: string }) {
  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-gold transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-sm text-muted">{toBnDigits(progress.done)}/{toBnDigits(progress.total)} · {toBnDigits(percent)}%{progress.bytes > 0 && ` · ${mb(progress.bytes)}`}</p>
    </div>
  );
}

/** One download at a time, which can be stopped. */
function useJob() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const run = async (work: (signal: AbortSignal, report: (p: Progress) => void) => Promise<string>) => {
    if (controller.current) return;
    const own = new AbortController();
    controller.current = own;
    setMessage("");
    try {
      // Ask the browser not to clear saved files when space runs low. It may say no.
      await navigator.storage?.persist?.().catch(() => false);
      setMessage(await work(own.signal, setProgress));
    } catch (error) {
      setMessage(explain(error));
    } finally {
      controller.current = null;
      setProgress(null);
    }
  };
  return { progress, message, setMessage, run, stop: () => controller.current?.abort() };
}

function InstallCard() {
  const { canInstall, installed } = usePwa();
  const [isApple] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent));
  return (
    <section className={card}>
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold"><Smartphone aria-hidden className="size-5 text-accent" /> অ্যাপ হিসেবে রাখুন</h2>
      {installed ? (
        <p className="flex items-center gap-2 text-accent"><Check aria-hidden className="size-5" /> অ্যাপ হিসেবে চলছে</p>
      ) : canInstall ? (
        <><p className="mb-3 text-muted">হোম স্ক্রিনে আইকন থাকবে, পুরো স্ক্রিনে খুলবে।</p><button type="button" className={primary} onClick={install}><Download aria-hidden className="size-5" /> ইনস্টল করুন</button></>
      ) : isApple ? (
        <p className="text-muted">Safari-তে নিচের <b>শেয়ার</b> বাটনে চাপুন, তারপর <b>Add to Home Screen</b> বেছে নিন।</p>
      ) : (
        <p className="text-muted">ব্রাউজারের মেনু থেকে “Install app” বা “Add to Home screen” বেছে নিন। কিছু ব্রাউজারে এই সুবিধা নেই।</p>
      )}
    </section>
  );
}

async function fetchWithRetry(url: string, signal: AbortSignal): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { signal, cache: "reload" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (signal.aborted || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
}

type Pack = { version: string; bytes: number; urls: string[] };

function QuranCard() {
  const [pack, setPack] = useState<Pack | null>(null);
  const [saved, setSaved] = useState(0);
  const [failed, setFailed] = useState(false);
  const job = useJob();

  const count = useCallback(async (list: Pack) => {
    const keys = new Set((await (await caches.open(QURAN_CACHE)).keys()).map((r) => new URL(r.url).pathname));
    setSaved(list.urls.filter((u) => keys.has(u)).length);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/offline-quran.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<Pack>; })
      .then(async (list) => { if (alive) { setPack(list); await count(list); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [count]);

  const complete = pack !== null && saved === pack.urls.length;

  const download = () => job.run(async (signal, report) => {
    const cache = await caches.open(QURAN_CACHE);
    let done = 0;
    report({ done, total: pack!.urls.length, bytes: 0 });
    // Re-download everything so a saved copy is never half old and half new.
    for (let i = 0; i < pack!.urls.length; i += 4) {
      await Promise.all(pack!.urls.slice(i, i + 4).map(async (url) => {
        await cache.put(url, await fetchWithRetry(url, signal));
        report({ done: ++done, total: pack!.urls.length, bytes: 0 });
      }));
    }
    await count(pack!);
    return "পুরো কুরআন সেভ হয়েছে। এখন ইন্টারনেট ছাড়াও পড়া ও খোঁজা যাবে।";
  }).finally(() => { if (pack) void count(pack); });

  const clear = async () => {
    await caches.delete(QURAN_CACHE);
    if (pack) await count(pack);
    job.setMessage("সেভ করা কুরআন মুছে ফেলা হয়েছে।");
  };

  return (
    <section className={`${card} space-y-3`}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><BookOpen aria-hidden className="size-5 text-accent" /> ইন্টারনেট ছাড়া কুরআন</h2>
      <p className="text-muted">১১৪টি সূরা (আরবি, উচ্চারণ, অর্থ), আয়াত সার্চ ও বুকমার্কের লেখা। অডিও আলাদা।{pack && ` সাইজ প্রায় ${mb(pack.bytes)}।`}</p>
      {failed && <p role="alert" className="text-accent">তালিকা আনা যায়নি। ইন্টারনেট চালু করে পাতাটি আবার খুলুন।</p>}
      {job.progress ? (
        <>
          <Bar progress={job.progress} label="কুরআন নামছে" />
          <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={job.stop}><Square aria-hidden className="size-4" /> থামান</button>
        </>
      ) : pack && (
        <div className="flex flex-wrap items-center gap-2">
          {complete && <span className="flex w-full items-center gap-2 font-semibold text-accent"><Check aria-hidden className="size-5" /> সেভ করা আছে</span>}
          <button type="button" className={complete ? chip(false) : primary} onClick={download}>{complete ? "আবার হালনাগাদ করুন" : <><Download aria-hidden className="size-5" /> {saved > 0 ? "আবার নামান" : "সেভ করুন"}</>}</button>
          {saved > 0 && <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={clear}><Trash2 aria-hidden className="size-4" /> মুছুন</button>}
        </div>
      )}
      <p role="status" className="text-sm text-accent empty:hidden">{job.message}</p>
    </section>
  );
}

function AudioCard({ surahs, juzs }: { surahs: SurahInfo[]; juzs: Place[] }) {
  const saved = useStored(SAVED_KEY, parseSaved);
  const [reciter, setReciter] = useState<string>(RECITERS[0].id);
  const [kind, setKind] = useState<"s" | "j">("s");
  const [number, setNumber] = useState(1);
  const [asking, setAsking] = useState<string | null>(null);
  const job = useJob();
  const unit: Unit = { reciter, unit: `${kind}${number}` };
  const already = saved.some((x) => savedId(x) === savedId(unit));
  const urls = urlsOf(unit, surahs, juzs);
  const title = (u: Unit) => (u.unit[0] === "s" ? `সূরা ${surahs[Number(u.unit.slice(1)) - 1].bangla}` : `পারা ${toBnDigits(u.unit.slice(1))}`);
  const reciterName = (id: string) => RECITERS.find((r) => r.id === id)!.name;
  const read = () => { try { return parseSaved(localStorage.getItem(SAVED_KEY)); } catch { return saved; } };

  const download = () => job.run(async (signal, report) => {
    const bytes = await saveAll(urls, await caches.open(AUDIO_CACHE), report, signal);
    const entry: Saved = { ...unit, bytes, ayahs: urls.length };
    writeStored(SAVED_KEY, JSON.stringify([entry, ...read().filter((x) => savedId(x) !== savedId(unit))]));
    return `${title(unit)} সেভ হয়েছে (${mb(bytes)})।`;
  });

  const remove = async (target: Saved) => {
    const rest = read().filter((x) => savedId(x) !== savedId(target));
    const cache = await caches.open(AUDIO_CACHE);
    await Promise.all(removableUrls(target, rest, surahs, juzs).map((url) => cache.delete(url)));
    writeStored(SAVED_KEY, JSON.stringify(rest));
    setAsking(null);
    job.setMessage(`${title(target)} মুছে ফেলা হয়েছে।`);
  };

  return (
    <section className={`${card} space-y-3`}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Headphones aria-hidden className="size-5 text-accent" /> অফলাইনে তিলাওয়াত</h2>
      <label className="block text-sm text-muted">ক্বারী
        <select className={select} value={reciter} disabled={!!job.progress} onChange={(e) => setReciter(e.target.value)}>{RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      </label>
      <div role="group" aria-label="সূরা না পারা" className="flex gap-2">
        {([["s", "সূরা"], ["j", "পারা"]] as const).map(([k, label]) => <button key={k} type="button" aria-pressed={kind === k} disabled={!!job.progress} className={chip(kind === k)} onClick={() => { setKind(k); setNumber(1); }}>{label}</button>)}
      </div>
      <label className="block text-sm text-muted">{kind === "s" ? "কোন সূরা" : "কোন পারা"}
        <select className={select} value={number} disabled={!!job.progress} onChange={(e) => setNumber(Number(e.target.value))}>
          {kind === "s" ? surahs.map((s) => <option key={s.n} value={s.n}>{toBnDigits(s.n)}. {s.bangla} ({toBnDigits(s.ayahs)} আয়াত)</option>) : juzs.map((_, i) => <option key={i} value={i + 1}>পারা {toBnDigits(i + 1)}</option>)}
        </select>
      </label>
      <p className="text-sm text-muted">{toBnDigits(urls.length)}টি আয়াতের অডিও। বড় সূরা বা পুরো পারায় ১০০ MB-এর বেশিও লাগতে পারে, তাই Wi-Fi ভালো।</p>
      {job.progress ? (
        <>
          <Bar progress={job.progress} label="অডিও নামছে" />
          <button type="button" className={`${chip(false)} flex items-center gap-2`} onClick={job.stop}><Square aria-hidden className="size-4" /> থামান</button>
        </>
      ) : (
        <button type="button" className={`${primary} w-full`} onClick={download}><Download aria-hidden className="size-5" /> {already ? "বাদ পড়া ফাইল আবার নামান" : "অডিও সেভ করুন"}</button>
      )}
      <p role="status" className="text-sm text-accent empty:hidden">{job.message}</p>

      {saved.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">সেভ করা আছে · মোট প্রায় {mb(saved.reduce((t, x) => t + x.bytes, 0))}</h3>
          <ul className="space-y-2">
            {saved.map((x) => (
              <li key={savedId(x)} className="rounded-2xl border border-line-strong p-3">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1"><span className="block truncate font-display font-semibold">{title(x)}</span><span className="block truncate text-sm text-muted">{reciterName(x.reciter)} · {mb(x.bytes)}</span></span>
                  <button type="button" disabled={!!job.progress} aria-label={`${title(x)} মুছুন`} className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent disabled:opacity-40" onClick={() => setAsking(savedId(x))}><Trash2 aria-hidden className="size-[1.125rem]" /></button>
                </div>
                {asking === savedId(x) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2"><span className="w-full text-sm">এই অডিও মুছবেন?</span><button type="button" className={chip(true)} onClick={() => remove(x)}>মুছুন</button><button type="button" className={chip(false)} onClick={() => setAsking(null)}>থাক</button></div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Center({ surahs, juzs }: { surahs: SurahInfo[]; juzs: Place[] }) {
  const [supported] = useState(() => "caches" in window && "serviceWorker" in navigator);
  return (
    <div className="space-y-4">
      <InstallCard />
      {supported ? (
        <><QuranCard /><AudioCard surahs={surahs} juzs={juzs} /></>
      ) : (
        <p role="alert" className={card}>এই ব্রাউজারে অফলাইনে সেভ করা যায় না। প্রাইভেট মোড বন্ধ করে বা অন্য ব্রাউজারে চেষ্টা করুন।</p>
      )}
      <p className="text-sm leading-relaxed text-muted">সেভ করা ফাইল শুধু এই ব্রাউজারে থাকে। ব্রাউজারের ডেটা মুছলে চলে যাবে, আর iPhone অনেকদিন ব্যবহার না হওয়া সাইটের ডেটা নিজে মুছে ফেলতে পারে। অ্যাপ হিসেবে ইনস্টল করলে এই ঝুঁকি কমে।</p>
    </div>
  );
}

export function OfflineCenter(props: { surahs: SurahInfo[]; juzs: Place[] }) {
  return useInBrowser() ? <Center {...props} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}
