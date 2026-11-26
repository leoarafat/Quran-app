"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { setOptions, setReciter, setSleep, skip, stop, toggle, useClock, usePlayer, useProgress, type PlayerState } from "@/lib/audio/player";
import { RECITERS } from "@/lib/audio/reciters";
import { GAP_CHOICES, RATE_CHOICES, REPEAT_CHOICES, SLEEP_CHOICES } from "@/lib/audio/sequence";
import { toBnDigits } from "@/lib/bn";
import { parseReaderPrefs, READER_KEY } from "@/lib/reader/prefs";
import type { Ayah, SurahData } from "@/lib/quran/types";
import { useStored, writeStored } from "@/lib/useStored";

export const STATUS_TEXT: Record<PlayerState["status"], string> = {
  idle: "", loading: "আনা হচ্ছে", playing: "চলছে", paused: "থেমে আছে", waiting: "বিরতি", error: "চালানো যায়নি",
};

export const isBusy = (status: PlayerState["status"]) => status === "playing" || status === "loading" || status === "waiting";
export const reciterName = (id: string) => RECITERS.find((r) => r.id === id)!.name;

export function PlayIcon({ status, className }: { status: PlayerState["status"]; className: string }) {
  if (status === "loading") return <Icon name="timer" className={`${className} animate-spin`} />;
  if (status === "error") return <Icon name="undo" className={className} />;
  return <Icon name={isBusy(status) ? "pause" : "play"} className={className} />;
}

export const playLabel = (status: PlayerState["status"]) => (isBusy(status) ? "থামান" : status === "error" ? "আবার চেষ্টা করুন" : "চালান");

/** "১:০৫" */
const time = (seconds: number) => toBnDigits(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);

function Timeline() {
  const progress = useProgress();
  const [heard, length] = useClock().split("|").map(Number);
  return (
    <div>
      <div aria-hidden="true" className="h-1 rounded-full bg-ln2"><div className="h-full rounded-full bg-gd" style={{ width: `${progress * 100}%` }} /></div>
      <p className="mt-1 flex justify-between text-xs tabular-nums text-ink2"><span>{time(heard)}</span><span>{time(length)}</span></p>
    </div>
  );
}

/** The words of the ayah being recited, from the same files the offline pack keeps. */
function NowPlaying({ surah, ayah }: { surah: number; ayah: number }) {
  const [loaded, setLoaded] = useState<{ surah: number; ayahs: Ayah[] } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/data/quran/${surah}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<SurahData>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => { if (alive) setLoaded({ surah, ayahs: data.ayahs }); })
      .catch(() => {}); // The controls work without the words.
    return () => { alive = false; };
  }, [surah]);
  const words = loaded?.surah === surah ? loaded.ayahs[ayah - 1] : undefined;
  if (!words) return null;
  return (
    <div className="max-h-[34dvh] overflow-y-auto rounded-[1.25rem] border border-ln bg-bg p-4 text-center">
      <p lang="ar" dir="rtl" className="rounded-md bg-gs px-2 font-arabic text-[1.875rem] leading-[2.2]">{words.ar}</p>
      <p className="reading mt-2 text-[0.9375rem] text-gt">{words.tr}</p>
      <p className="reading mt-1">{words.bn}</p>
    </div>
  );
}

/** A tile that opens the phone's own list of choices. */
function Tile<T extends string | number>({ icon, label, value, options, text, short, onChange }: {
  icon: IconName; label: string; value: T; options: readonly T[]; text: (v: T) => string; short?: (v: T) => string; onChange: (v: T) => void;
}) {
  return (
    <label className="relative flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border border-ln px-1 text-center has-focus-visible:outline-2 has-focus-visible:outline-ac">
      <Icon name={icon} className="size-5 text-gd" />
      <span aria-hidden="true" className="text-xs leading-snug text-ink2">{label}</span>
      <b aria-hidden="true" className="w-full truncate text-sm">{(short ?? text)(value)}</b>
      <select aria-label={label} value={value} onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)} className="absolute inset-0 size-full cursor-pointer opacity-0">
        {options.map((o) => <option key={o} value={o} className="text-black">{text(o)}</option>)}
      </select>
    </label>
  );
}

/** Everything the player can do: used by the full-screen player and by the reader's side panel. */
export function PlayerControls({ fallback, words = false, onLeave }: { /** shown while nothing is playing */ fallback?: React.ReactNode; words?: boolean; /** closes the sheet before moving away */ onLeave?: () => void }) {
  const { track, position, status, reciter, options, sleep } = usePlayer();
  const prefs = useStored(READER_KEY, parseReaderPrefs);
  if (!track) return <>{fallback}</>;

  const times = (n: number) => (n === 0 ? "বারবার" : `${toBnDigits(n)} বার`);
  const round = toBnDigits(position.round ?? 1);
  const passage = track.loop === undefined ? "" : `আয়াত ${toBnDigits(track.first ?? 1)}-${toBnDigits(track.total)} · ${track.loop === 0 ? `${round} বার` : `${round}/${toBnDigits(track.loop)} বার`}`;
  const side = "grid size-13 place-items-center rounded-full disabled:opacity-35";
  const row = "flex min-h-12 items-center justify-center gap-2 rounded-full border border-ln2 px-3 text-center text-sm font-semibold";

  return (
    <div className="space-y-4">
      {words && <NowPlaying surah={track.surah} ayah={position.ayah} />}
      <div>
        <p className="font-display text-lg font-semibold">{track.surahName} · আয়াত {toBnDigits(position.ayah)}</p>
        <p className="text-sm text-ink2">{reciterName(reciter)} · {STATUS_TEXT[status]}{passage && ` · ${passage}`}</p>
        {status === "error" && <p role="alert" className="mt-1 text-sm font-semibold text-gt">অডিও আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন, অথবা অন্য ক্বারী নিন।</p>}
      </div>
      <Timeline />
      <div className="flex items-center justify-center gap-8">
        <button type="button" aria-label="আগের আয়াত" className={side} onClick={() => skip(-1)} disabled={position.ayah <= (track.first ?? 1)}><Icon name="prev" className="size-7" /></button>
        <button type="button" aria-label={playLabel(status)} onClick={toggle} className="grid size-[4.75rem] place-items-center rounded-full bg-gold text-on-gold"><PlayIcon status={status} className="size-8" /></button>
        <button type="button" aria-label="পরের আয়াত" className={side} onClick={() => skip(1)} disabled={position.ayah >= track.total}><Icon name="next" className="size-7" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Tile icon="timer" label="গতি" value={options.rate} options={RATE_CHOICES} text={(r) => `${toBnDigits(r)}×`} onChange={(rate) => setOptions({ rate })} />
        <Tile icon="repeat" label="প্রতি আয়াত" value={options.repeatEach} options={REPEAT_CHOICES} text={times} onChange={(repeatEach) => setOptions({ repeatEach })} />
        <Tile icon="moon" label="ঘুমের টাইমার" value={sleep?.minutes ?? 0} options={SLEEP_CHOICES} text={(m) => (m === 0 ? "বন্ধ" : `${toBnDigits(m)} মিনিট পর`)} onChange={setSleep} />
        <Tile icon="clock" label="মাঝে বিরতি" value={options.gap} options={GAP_CHOICES} text={(g) => (g === 0 ? "নেই" : `${toBnDigits(g)} সেকেন্ড`)} onChange={(gap) => setOptions({ gap })} />
        <div className="col-span-2 grid">
          <Tile icon="user" label="ক্বারী" value={reciter} options={RECITERS.map((r) => r.id)} text={reciterName} onChange={setReciter} />
        </div>
      </div>
      <div className="divide-y divide-ln border-y border-ln">
        <Toggle label="হাইলাইট অনুসরণ করুক" hint="রিডারে চলমান আয়াতে পাতা চলে যাবে" checked={prefs.follow} onChange={(follow) => writeStored(READER_KEY, JSON.stringify({ ...prefs, follow }))} />
        {/* A chosen passage is always played through, so the choice does not apply to it. */}
        <Toggle label="পরের আয়াত নিজে থেকে চলবে" hint={passage ? "বাছাই করা অংশ পুরোটাই চলবে" : undefined} disabled={!!passage} checked={!!passage || options.mode === "continue"} onChange={(on) => setOptions({ mode: on ? "continue" : "single" })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/quran/${track.surah}/#a${position.ayah}`} onClick={onLeave} className={row}>চলমান আয়াতে যান</Link>
        <button type="button" onClick={() => { onLeave?.(); stop(); }} className={row}><Icon name="close" className="size-5" /> বন্ধ করুন</button>
      </div>
    </div>
  );
}
