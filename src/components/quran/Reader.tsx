"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Seg } from "@/components/ui/Seg";
import { showToast } from "@/components/ui/Toast";
import { playAyah, usePlayerValue, type Track } from "@/lib/audio/player";
import { toggleAyahBookmark } from "@/lib/ayahActions";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { useIsBookmarked, useLibrary } from "@/lib/bookmarks/store";
import { LINE_HEIGHTS, parseReaderPrefs, READER_KEY, READING_MODES, type ReaderPrefs } from "@/lib/reader/prefs";
import { saveLastRead } from "@/lib/quran/lastRead";
import { remember as rememberSurah } from "@/lib/quran/recent";
import type { SurahData, SurahInfo } from "@/lib/quran/types";
import { useStored, writeStored } from "@/lib/useStored";
import { AyahActions, AyahCard } from "./AyahCard";
import { Mushaf } from "./Mushaf";
import { NoteForm } from "./NoteSheet";
import { PinchArea } from "./PinchArea";
import { PlayerControls } from "./PlayerControls";
import { RangeRepeat } from "./RangeRepeat";
import { ReaderSettings } from "./ReaderSettings";
import { SurahList } from "./SurahList";

type Sheet = "settings" | "jump" | "surahs" | "ayah" | null;
type PanelTab = "settings" | "note" | "audio";

const VIEWS = [{ value: "ayah", text: "আয়াত-ভিত্তিক" }, { value: "mushaf", text: "মুসহাফ" }] as const;
const PANEL_TABS = [{ value: "settings", text: "সেটিংস" }, { value: "note", text: "নোট" }, { value: "audio", text: "অডিও" }] as const;
const iconButton = "grid size-11 shrink-0 place-items-center rounded-xl disabled:opacity-35";

function JumpForm({ total, onGo }: { total: number; onGo: (ayah: number) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const n = Number(toAsciiDigits(text.trim()));
    if (!Number.isInteger(n) || n < 1 || n > total) return setError(`১ থেকে ${toBnDigits(total)}-এর মধ্যে লিখুন`);
    setError("");
    onGo(n);
  };
  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input inputMode="numeric" aria-label="আয়াত নম্বর" value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder={`আয়াত নম্বর (১-${toBnDigits(total)})`} className="min-h-12 min-w-0 flex-1 rounded-full border border-ln2 bg-bg px-4" />
        <button type="submit" className="min-h-12 rounded-full bg-ac px-6 font-semibold text-on-ac">যান</button>
      </div>
      {error && <p role="alert" className="text-sm text-gt">{error}</p>}
    </form>
  );
}

/** The bar under the reading column on phones and tablets. */
function Dock({ track, current, playing, previous, next, onSheet }: { track: Track; current: number; playing: boolean; previous?: SurahInfo; next?: SurahInfo; onSheet: (s: Sheet) => void }) {
  const bookmarked = useIsBookmarked(track.surah, current);
  const around = (surah: SurahInfo | undefined, icon: "prev" | "next", label: string) =>
    surah ? (
      <Link href={`/quran/${surah.n}/`} aria-label={`${label}: ${surah.bangla}`} className={iconButton}><Icon name={icon} /></Link>
    ) : (
      <span aria-hidden="true" className={`${iconButton} opacity-35`}><Icon name={icon} /></span>
    );
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-32 bg-linear-to-b from-transparent to-bg to-70% md:left-[18.5rem] lg:hidden" />
      <nav aria-label="রিডার নিয়ন্ত্রণ" className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-lg items-center justify-between rounded-[1.625rem] border border-ln bg-sf px-2.5 py-1.5 shadow-float md:left-[calc(18.5rem+0.75rem)] lg:hidden">
        {around(previous, "prev", "আগের সূরা")}
        <button type="button" aria-haspopup="dialog" onClick={() => onSheet("jump")} className="flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-2.5 text-[0.9375rem] font-semibold max-xs:px-1">
          <Icon name="list" className="size-[1.375rem] max-xs:hidden" /> আয়াত {toBnDigits(current)}
        </button>
        <button type="button" aria-label="পঠন সেটিংস" aria-haspopup="dialog" onClick={() => onSheet("settings")} className={iconButton}><Icon name="settings" /></button>
        {playing ? (
          <button type="button" aria-label={`আয়াত ${toBnDigits(current)} বুকমার্ক`} aria-pressed={bookmarked} onClick={() => toggleAyahBookmark(track.surah, current)} className={`${iconButton} ${bookmarked ? "text-ac" : ""}`}><Icon name="bookmark" filled={bookmarked} /></button>
        ) : (
          <button type="button" aria-label="তিলাওয়াত শুনুন" onClick={() => playAyah(track, current)} className={`${iconButton} !rounded-full bg-ac text-on-ac`}><Icon name="play" /></button>
        )}
        {around(next, "next", "পরের সূরা")}
      </nav>
    </>
  );
}

export function Reader({ data, surahs, credit }: { data: SurahData; surahs: SurahInfo[]; credit: string }) {
  const info = surahs[data.n - 1];
  const previous = surahs[data.n - 2];
  const next = surahs[data.n];
  const track: Track = useMemo(() => ({ surah: data.n, surahName: info.bangla, total: data.ayahs.length }), [data, info.bangla]);
  const prefs = useStored(READER_KEY, parseReaderPrefs);
  const savePrefs = (value: ReaderPrefs) => writeStored(READER_KEY, JSON.stringify(value));
  const mushaf = prefs.mushaf;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tab, setTab] = useState<PanelTab>("settings");
  const [selected, setSelected] = useState<number | null>(null);
  /** the ayah at the reading line */
  const [current, setCurrent] = useState(1);
  // The suggested first ayah while the passage form is open; null while it is closed.
  const [rangeFrom, setRangeFrom] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** set once the visitor marks the stopping place, so scrolling on does not move it */
  const marked = useRef(false);
  const playing = usePlayerValue((s) => (s.track?.surah === data.n && s.status !== "idle" ? s.position.ayah : null));
  const library = useLibrary();

  const shown = playing ?? current;
  const focusAyah = data.ayahs[(selected ?? shown) - 1] ?? data.ayahs[0];
  const noteText = library.items.find((b) => b.s === data.n && b.a === focusAyah.a)?.note ?? "";
  const juz = (data.ayahs[shown - 1] ?? data.ayahs[0]).juz;
  const meta = `${info.revelation === "meccan" ? "মাক্কি" : "মাদানি"} · ${toBnDigits(info.ayahs)} আয়াত · পারা ${toBnDigits(data.ayahs[0].juz)}`;

  useEffect(() => rememberSurah(data.n), [data.n]);

  // A link to an ayah from inside the app lands short: the ayahs not yet drawn only have guessed
  // heights. Aim again while they take their real size, until the reader moves by themselves.
  useEffect(() => {
    const id = /^#(a\d+)$/.exec(window.location.hash)?.[1];
    if (!id) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const stop = () => clearTimeout(timer);
    const aim = () => {
      const node = document.getElementById(id);
      if (!node) return;
      const wanted = parseFloat(getComputedStyle(node).scrollMarginTop) + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
      if (Math.abs(node.getBoundingClientRect().top - wanted) > 4) node.scrollIntoView({ block: "start" });
      if (++tries < 8) timer = setTimeout(aim, 120);
    };
    timer = setTimeout(aim, 60);
    const moves = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    moves.forEach((name) => window.addEventListener(name, stop, { passive: true, once: true }));
    return () => {
      stop();
      moves.forEach((name) => window.removeEventListener(name, stop));
    };
  }, []);

  // Follow the recitation.
  useEffect(() => {
    if (!playing || !prefs.follow) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`a${playing}`)?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
  }, [playing, prefs.follow]);

  // Remember the ayah at the reading line, once the visitor has actually scrolled or opened it.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.ayah);
          if (e.isIntersecting) visible.add(n);
          else visible.delete(n);
        }
        if (!visible.size) return;
        const at = Math.min(...visible);
        setCurrent(at);
        if (!marked.current && (window.scrollY > 0 || location.hash)) saveLastRead({ s: data.n, a: at });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    list.querySelectorAll("[data-ayah]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [data.n, mushaf]);

  // The saved view is applied after the page loads and changes where every ayah sits.
  useEffect(() => {
    if (mushaf && /^#a\d+$/.test(location.hash)) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
  }, [mushaf]);

  const select = useCallback((a: number) => setSelected((was) => (was === a ? null : a)), []);
  const markLast = useCallback((a: number) => {
    marked.current = true;
    saveLastRead({ s: data.n, a });
    showToast(`শেষ পড়া রাখা হলো: আয়াত ${toBnDigits(a)}`);
  }, [data.n]);
  const openAyah = useCallback((a: number) => { setSelected(a); setSheet("ayah"); }, []);

  const goTo = (n: number) => {
    setSheet(null);
    history.replaceState(null, "", `#a${n}`);
    setSelected(n);
    // After the sheet is gone, which would otherwise hand focus (and the scroll) back to its button.
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`a${n}`)?.scrollIntoView({ block: "start" })));
  };

  // Suggest the ayah being recited, else the one being read.
  const toggleRange = () => setRangeFrom((open) => (open === null ? (playing ?? (window.scrollY > 0 ? current : 1)) : null));
  const setView = (view: (typeof VIEWS)[number]["value"]) => {
    const mode = READING_MODES.find((m) => m.id === (view === "mushaf" ? "mushaf" : "full"))!;
    savePrefs({ ...prefs, ...mode.prefs });
  };

  const sidePane = "sticky top-[calc(var(--header-h)+var(--safe-top))] h-[calc(100dvh-var(--header-h)-var(--safe-top))] shrink-0 flex-col";

  return (
    <div data-reader className="md:flex md:items-start" style={{ "--ar-lh": LINE_HEIGHTS[prefs.lineGap] } as React.CSSProperties}>
      <aside aria-label="সূরা তালিকা" className={`${sidePane} hidden w-[13.75rem] border-r border-ln px-3 py-4 md:flex lg:hidden reading:flex reading:w-[17rem]`}>
        <SurahList surahs={surahs} current={data.n} />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 bg-bg pt-[var(--safe-top)] md:hidden">
          <div className="flex h-14 items-center px-1">
            <Link href="/quran/" aria-label="সূরা তালিকায় ফিরে যান" className={iconButton}><Icon name="back" /></Link>
            <div className="min-w-0 flex-1 text-center leading-snug">
              <h1 className="truncate font-display text-[1.0625rem] font-semibold">{info.bangla}</h1>
              <p className="truncate text-xs tabular-nums text-ink2">আয়াত {toBnDigits(shown)} / {toBnDigits(info.ayahs)} · পারা {toBnDigits(juz)}</p>
            </div>
            <button type="button" aria-label="সূরা বদলান" aria-haspopup="dialog" onClick={() => setSheet("surahs")} className={iconButton}><Icon name="list" /></button>
          </div>
          <div role="progressbar" aria-label="সূরায় কতদূর" aria-valuemin={1} aria-valuemax={info.ayahs} aria-valuenow={shown} className="h-[3px] border-t border-ln bg-ln">
            <div className="h-full bg-gd" style={{ width: `${(shown / info.ayahs) * 100}%` }} />
          </div>
        </header>

        <div className="mx-auto max-w-[45rem] px-2 pb-6 pt-4 md:px-4 md:pt-6">
          <div className="relative mx-2 flex flex-col items-center rounded-[1.25rem] border border-ln bg-sf p-4 text-center">
            <span aria-hidden="true" className="pointer-events-none absolute inset-[5px] rounded-md border border-gd/45" />
            <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-[1.9]">{info.arabic}</p>
            {/* The page's heading from tablet width, where the phone's top bar is not shown. */}
            <p className="hidden font-display text-xl font-semibold md:block" role="heading" aria-level={1}>{info.bangla}</p>
            <p className="font-display text-[1.0625rem] font-semibold md:hidden">{info.bangla}</p>
            <p className="text-[0.8125rem] text-ink2">{meta}</p>
          </div>

          <PinchArea>
            {data.basmalah && (
              <div className="px-2 pt-3 text-center">
                {(prefs.arabic || mushaf) && <p lang="ar" dir="rtl" className="font-arabic text-[calc(1.625rem*var(--ar-scale))] leading-[2.1] text-gt">{data.basmalah}</p>}
                {!mushaf && prefs.pronunciation && <p className="reading text-[calc(0.9375rem*var(--bn-scale))] text-ink2">{data.basmalahTr}</p>}
              </div>
            )}

            <div className="my-3 flex flex-wrap justify-center gap-2">
              {/* Between the dock and the wide layout's list, this is the way to another surah. */}
              <span className="hidden lg:contents reading:hidden"><Chip aria-haspopup="dialog" onClick={() => setSheet("surahs")}><Icon name="list" className="size-5 text-ac" /> সূরা বদলান</Chip></span>
              <Chip onClick={() => playAyah(track, 1)}><Icon name="play" className="size-5 text-ac" /> পুরো সূরা শুনুন</Chip>
              <Chip aria-expanded={rangeFrom !== null} aria-controls="range-repeat" className={rangeFrom !== null ? "!bg-gs" : ""} onClick={toggleRange}><Icon name="repeat" className="size-5 text-ac" /> অংশ বারবার</Chip>
            </div>
            <div className="px-2">
              {rangeFrom !== null && <RangeRepeat id="range-repeat" track={track} startAt={rangeFrom} onStart={() => setRangeFrom(null)} />}
              {mushaf && <Seg label="দেখার ধরন" options={VIEWS} value="mushaf" onChange={setView} className="mb-3" />}
              {!mushaf && prefs.pronunciation && (
                <p className="mb-1 text-center text-[0.8125rem] leading-relaxed text-ink2">
                  বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি। তিলাওয়াত শুনে মিলিয়ে পড়ুন। <Link href="/about/" className="text-ac underline">বিস্তারিত</Link>
                </p>
              )}
            </div>

            <div ref={listRef}>
              {mushaf ? (
                <div className="px-2"><Mushaf ayahs={data.ayahs} track={track} onOpen={openAyah} /></div>
              ) : (
                <ol>
                  {data.ayahs.map((ayah) => (
                    <AyahCard key={ayah.a} ayah={ayah} track={track} layers={prefs} credit={credit} numbers={prefs.numbers} selected={selected === ayah.a} onSelect={select} onMarkLast={markLast} />
                  ))}
                </ol>
              )}
            </div>
          </PinchArea>

          <nav aria-label="অন্য সূরা" className="mt-6 flex gap-3 px-2">
            {previous ? <Link href={`/quran/${previous.n}/`} className="flex min-h-14 flex-1 items-center gap-2 rounded-full border border-ln2 bg-sf px-4 font-display font-semibold"><Icon name="back" className="size-5 text-ac" /><span className="truncate">{previous.bangla}</span></Link> : <span className="flex-1" />}
            {next ? <Link href={`/quran/${next.n}/`} className="flex min-h-14 flex-1 items-center justify-end gap-2 rounded-full border border-ln2 bg-sf px-4 font-display font-semibold"><span className="truncate">{next.bangla}</span><Icon name="chev" className="size-5 text-ac" /></Link> : <span className="flex-1" />}
          </nav>
          <p className="mt-4 px-2 text-center text-sm text-ink2">{credit} · <Link href="/about/" className="underline">উৎস ও শর্ত</Link></p>
        </div>
        {/* Room for the dock, so it never covers the end of the page. */}
        <div aria-hidden="true" className="h-24 lg:hidden" />
      </div>

      <aside aria-label="পঠন প্যানেল" className={`${sidePane} hidden w-[20rem] gap-4 overflow-y-auto border-l border-ln bg-rail p-5 lg:flex`}>
        <Seg label="প্যানেল" options={PANEL_TABS} value={tab} onChange={setTab} className="shrink-0" />
        {tab === "settings" && (
          <>
            <div className="shrink-0"><JumpForm total={info.ayahs} onGo={goTo} /></div>
            <div className="shrink-0"><ReaderSettings prefs={prefs} onChange={savePrefs} sample={focusAyah} compact /></div>
          </>
        )}
        {tab === "note" && (
          <div className="space-y-3">
            <NoteForm key={`${focusAyah.a}:${noteText}`} surah={data.n} ayah={focusAyah.a} />
            <p className="text-[0.8125rem] text-ink2">অন্য আয়াতের নোটের জন্য সেই আয়াতে চাপ দিন।</p>
            <Link href="/bookmarks/" className="flex min-h-11 items-center text-sm font-semibold text-ac">সব বুকমার্ক ও নোট</Link>
          </div>
        )}
        {tab === "audio" && <PlayerControls fallback={<button type="button" onClick={() => playAyah(track, shown)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ac font-semibold text-on-ac"><Icon name="play" className="size-5" /> আয়াত {toBnDigits(shown)} থেকে শুনুন</button>} />}
      </aside>

      <Dock track={track} current={shown} playing={playing !== null} previous={previous} next={next} onSheet={setSheet} />

      {sheet === "settings" && (
        <BottomSheet title="পঠন সেটিংস" onClose={() => setSheet(null)}>
          <ReaderSettings prefs={prefs} onChange={savePrefs} sample={focusAyah} />
        </BottomSheet>
      )}
      {sheet === "jump" && (
        <BottomSheet title="আয়াতে যান" onClose={() => setSheet(null)}>
          <JumpForm total={info.ayahs} onGo={goTo} />
        </BottomSheet>
      )}
      {sheet === "surahs" && (
        <BottomSheet title="সূরা বদলান" onClose={() => setSheet(null)} full>
          <div className="flex h-[70dvh] flex-col"><SurahList surahs={surahs} current={data.n} onPick={() => setSheet(null)} /></div>
        </BottomSheet>
      )}
      {sheet === "ayah" && selected !== null && (
        <BottomSheet title={`আয়াত ${toBnDigits(selected)}`} onClose={() => setSheet(null)}>
          <p className="reading text-[calc(0.9375rem*var(--bn-scale))] text-gt">{data.ayahs[selected - 1].tr}</p>
          <p className="reading text-[calc(1.0625rem*var(--bn-scale))] leading-[1.8]">{data.ayahs[selected - 1].bn}</p>
          {data.ayahs[selected - 1].fn && <p className="whitespace-pre-line text-sm text-ink2">{data.ayahs[selected - 1].fn}</p>}
          <p className="text-[0.8125rem] text-ink2">উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি।</p>
          <AyahActions ayah={data.ayahs[selected - 1]} track={track} credit={credit} onMarkLast={markLast} />
        </BottomSheet>
      )}
    </div>
  );
}
