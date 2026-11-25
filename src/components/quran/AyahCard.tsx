"use client";

import { memo, useState } from "react";
import { AyahOrnament } from "@/components/ui/AyahOrnament";
import { Icon, type IconName } from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import { playAyah, toggle, usePlayerValue, type Track } from "@/lib/audio/player";
import { copyAyah, shareAyahText, toggleAyahBookmark } from "@/lib/ayahActions";
import { toBnDigits } from "@/lib/bn";
import { useLibrary } from "@/lib/bookmarks/store";
import type { Layers } from "@/lib/reader/prefs";
import type { Ayah } from "@/lib/quran/types";
import { NoteSheet } from "./NoteSheet";
import { ShareSheet } from "./ShareSheet";

export function useAyahAudio(surah: number, ayah: number) {
  const here = usePlayerValue((s) => s.track?.surah === surah && s.position.ayah === ayah);
  const sounding = usePlayerValue((s) => s.track?.surah === surah && s.position.ayah === ayah && (s.status === "playing" || s.status === "loading" || s.status === "waiting"));
  return { here, sounding };
}

function Action({ icon, label, onClick, pressed, filled, popup }: { icon: IconName; label: string; onClick: () => void; pressed?: boolean; filled?: boolean; popup?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} aria-haspopup={popup ? "dialog" : undefined} onClick={onClick} className={`grid size-11 shrink-0 place-items-center rounded-xl ${pressed || filled ? "text-ac" : ""}`}>
      <Icon name={icon} className="size-[1.375rem]" filled={filled} />
    </button>
  );
}

/** Play, bookmark, note, copy, share and, in the reader, "I stopped here". */
export function AyahActions({ ayah, track, credit, onMarkLast }: { ayah: Ayah; track: Track; credit: string; onMarkLast?: (a: number) => void }) {
  const { here, sounding } = useAyahAudio(track.surah, ayah.a);
  const library = useLibrary();
  const saved = library.items.find((b) => b.s === track.surah && b.a === ayah.a);
  const [sheet, setSheet] = useState<"share" | "note" | null>(null);
  const name = `আয়াত ${toBnDigits(ayah.a)}`;

  return (
    <div role="group" aria-label={`${name}-এর অপশন`} className="flex justify-between rounded-md border border-ln bg-sf px-1 py-0.5 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)]">
      <Action icon={sounding ? "pause" : "play"} label={`${name} ${sounding ? "থামান" : "শুনুন"}`} onClick={() => (here ? toggle() : playAyah(track, ayah.a))} />
      <Action icon="bookmark" label={`${name} বুকমার্ক`} pressed={!!saved} filled={!!saved} onClick={() => toggleAyahBookmark(track.surah, ayah.a)} />
      <Action icon="note" label={`${name}-এ নোট লিখুন`} popup onClick={() => setSheet("note")} />
      <Action icon="copy" label={`${name} কপি করুন`} onClick={async () => showToast(await copyAyah(track, ayah, credit))} />
      <Action icon="share" label={`${name} শেয়ার করুন`} popup onClick={() => setSheet("share")} />
      {onMarkLast && <Action icon="flag" label={`${name} শেষ পড়া হিসেবে রাখুন`} onClick={() => onMarkLast(ayah.a)} />}
      {sheet === "note" && <NoteSheet surah={track.surah} surahName={track.surahName} ayah={ayah.a} onClose={() => setSheet(null)} />}
      {sheet === "share" && (
        <ShareSheet
          content={{ surah: track.surah, ayah: ayah.a, surahName: track.surahName, arabic: ayah.ar, translation: ayah.bn, credit }}
          pronunciation={ayah.tr}
          onShareText={async () => {
            // Close first, so the result message is not hidden behind the sheet.
            setSheet(null);
            const message = await shareAyahText(track, ayah, credit);
            if (message) showToast(message);
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

type Props = {
  ayah: Ayah;
  track: Track;
  layers: Layers;
  credit: string;
  /** element id, where ayah numbers alone could repeat */
  anchor?: string;
  /** In the reader the actions open on the chosen ayah only. Elsewhere they are always shown. */
  onSelect?: (a: number) => void;
  selected?: boolean;
  onMarkLast?: (a: number) => void;
  numbers?: boolean;
};

export const AyahCard = memo(function AyahCard({ ayah, track, layers, credit, anchor, onSelect, selected = false, onMarkLast, numbers = true }: Props) {
  const { here, sounding } = useAyahAudio(track.surah, ayah.a);
  const selectable = onSelect !== undefined;
  const open = !selectable || selected;
  const name = `আয়াত ${toBnDigits(ayah.a)}`;
  const mark = <AyahOrnament label={numbers ? toBnDigits(ayah.a) : ""} />;

  // A tap anywhere on the ayah opens its actions; text selection and inner controls are left alone.
  const tap = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("button, a, summary, details, dialog, [role=group]")) return;
    if (window.getSelection()?.toString()) return;
    onSelect?.(ayah.a);
  };

  return (
    <li id={anchor ?? `a${ayah.a}`} data-ayah={ayah.a} className="scroll-mt-16 border-b border-ln py-1 last:border-0 md:scroll-mt-3 [content-visibility:auto] [contain-intrinsic-size:auto_16rem]">
      {/* The number button does the same for keyboards. */}
      <div onClick={selectable ? tap : undefined} className={`flex flex-col gap-1.5 rounded-md px-2 py-2.5 transition-colors duration-200 ${(selectable && selected) || here ? "bg-gs" : ""}`}>
        <div className="flex min-h-11 items-center justify-between gap-2">
          {selectable ? (
            <button type="button" aria-expanded={selected} aria-label={`${name}-এর অপশন ${selected ? "বন্ধ করুন" : "খুলুন"}`} onClick={() => onSelect(ayah.a)} className="-ml-1.5 grid size-11 place-items-center rounded-full">{mark}</button>
          ) : (
            <span>{mark}<span className="sr-only">{name}</span></span>
          )}
          <span className="text-right text-xs">
            {sounding ? <span className="font-semibold text-gt">তিলাওয়াত চলছে</span> : selectable && selected ? <span className="text-ink2">সূরা {toBnDigits(track.surah)} · {name}</span> : null}
            {ayah.sajdah && <span className="ml-2 rounded-full border border-gd px-2.5 py-0.5 font-semibold text-gt">সিজদার আয়াত</span>}
          </span>
        </div>
        {layers.arabic && <p lang="ar" dir="rtl" className="pt-2 font-arabic text-[calc(1.9375rem*var(--ar-scale))] leading-[var(--ar-lh,2.25)] md:text-[calc(2.125rem*var(--ar-scale))]">{ayah.ar}</p>}
        {layers.pronunciation && (
          <p className="reading text-[calc(0.9375rem*var(--bn-scale))] leading-[1.75] text-gt md:text-[calc(1rem*var(--bn-scale))]"><span className="sr-only">উচ্চারণ: </span>{ayah.tr}</p>
        )}
        {layers.translation && (
          <>
            <p className="reading text-[calc(1.0625rem*var(--bn-scale))] leading-[1.8] md:text-[calc(1.125rem*var(--bn-scale))]">{ayah.bn}</p>
            {ayah.fn && (
              <details className="text-ink2">
                <summary className="flex min-h-11 w-fit cursor-pointer items-center text-sm font-semibold text-ac">টীকা দেখুন</summary>
                <p className="whitespace-pre-line text-[calc(0.9375rem*var(--bn-scale))]">{ayah.fn}</p>
              </details>
            )}
          </>
        )}
        {open && <div className="mt-1.5"><AyahActions ayah={ayah} track={track} credit={credit} onMarkLast={onMarkLast} /></div>}
      </div>
    </li>
  );
});
