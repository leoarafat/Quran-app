"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toBnDigits } from "@/lib/bn";
import { drawCard, loadCardFonts, type CardContent } from "@/lib/share/card";
import { phoneIsDark, resolveTheme, THEME_LABELS, THEMES, type Theme } from "@/lib/settings";
import { useSettings } from "@/lib/useSettings";
import { Icon } from "@/components/ui/Icon";

const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-ac bg-ac font-semibold text-on-ac" : "border-ln2"}`;
const action = "flex min-h-12 items-center justify-center gap-2 rounded-full border border-ln2 px-4 font-semibold text-gt disabled:opacity-40";

type Picture = { key: string; url: string; file: File } | { key: string; failed: true };

export function ShareSheet({ content, pronunciation, onShareText, onClose }: {
  content: Omit<CardContent, "pronunciation">;
  pronunciation: string;
  onShareText: () => void;
  onClose: () => void;
}) {
  const settings = useSettings();
  const dialog = useRef<HTMLDialogElement>(null);
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(settings.theme, phoneIsDark()));
  // Off unless asked for: the pronunciation is not verified yet, and a picture travels without the app.
  const [withPronunciation, setWithPronunciation] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [picture, setPicture] = useState<Picture | null>(null);
  const [message, setMessage] = useState("");

  const { surah, ayah, surahName, arabic, translation, credit } = content;
  const key = `${theme}:${withPronunciation}:${attempt}`;
  // A picture made with earlier choices must never be shared as the current one.
  const ready = picture?.key === key ? picture : null;
  const image = ready && "url" in ready ? ready : null;
  const name = `noor-quran-${surah}-${ayah}.png`;

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
  }, []);

  useEffect(() => {
    let alive = true;
    const make = async () => {
      const card: CardContent = { surah, ayah, surahName, arabic, translation, credit, pronunciation: withPronunciation ? pronunciation : null };
      await loadCardFonts(card);
      const canvas = document.createElement("canvas");
      drawCard(canvas, card, theme);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("No picture");
      if (alive) setPicture({ key, url: URL.createObjectURL(blob), file: new File([blob], name, { type: "image/png" }) });
    };
    make().catch(() => { if (alive) setPicture({ key, failed: true }); });
    return () => { alive = false; };
  }, [key, theme, withPronunciation, surah, ayah, surahName, arabic, translation, credit, pronunciation, name]);

  // Free each picture once it is replaced or the sheet closes.
  const url = picture && "url" in picture ? picture.url : null;
  useEffect(() => (url ? () => URL.revokeObjectURL(url) : undefined), [url]);

  const canShareImage = !!image && typeof navigator.canShare === "function" && navigator.canShare({ files: [image.file] });

  const shareImage = async () => {
    if (!image) return;
    try {
      await navigator.share({ files: [image.file] });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("ছবি শেয়ার করা যায়নি। “ছবি সেভ” চেষ্টা করুন।");
    }
  };
  const saveImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image.url;
    link.download = name;
    link.click();
    setMessage("ছবি ডাউনলোড শুরু হয়েছে।");
  };

  const title = `সূরা ${surahName} ${toBnDigits(surah)}:${toBnDigits(ayah)}`;

  return createPortal(
    <dialog
      ref={dialog}
      aria-label={`${title} শেয়ার`}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      className="m-auto mb-0 max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[1.75rem] border border-ln2 bg-sf p-0 text-ink backdrop:bg-black/65 sm:mb-auto sm:rounded-[1.75rem]"
    >
      <div className="space-y-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="বন্ধ করুন" autoFocus onClick={() => dialog.current?.close()} className="grid size-11 shrink-0 place-items-center rounded-full border border-ln2 text-gt"><Icon name="close" className="size-5" /></button>
        </div>

        <div className="flex h-[38dvh] min-h-48 items-center justify-center overflow-hidden rounded-2xl border border-ln bg-bg p-2">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- a picture made in the browser; there is nothing to optimise
            <img src={image.url} alt={`${title}-এর ছবি: আরবি ও বাংলা অনুবাদ`} className="h-full w-full object-contain" />
          ) : ready ? (
            <div className="text-center">
              <p role="alert" className="text-sm text-ink2">ছবি বানানো যায়নি। লেখা শেয়ার করা যাবে।</p>
              <button type="button" className="min-h-11 font-semibold text-gt underline" onClick={() => setAttempt((n) => n + 1)}>আবার চেষ্টা করুন</button>
            </div>
          ) : (
            <p role="status" className="flex items-center gap-2 text-sm text-ink2"><Icon name="image" className="size-5" /> ছবি তৈরি হচ্ছে…</p>
          )}
        </div>

        <div role="group" aria-label="ছবির রং" className="grid grid-cols-4 gap-2">
          {THEMES.map((value) => <button key={value} type="button" aria-pressed={theme === value} className={chip(theme === value)} onClick={() => { setTheme(value); setMessage(""); }}>{THEME_LABELS[value]}</button>)}
        </div>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={withPronunciation} onChange={(e) => { setWithPronunciation(e.target.checked); setMessage(""); }} className="size-5 shrink-0 accent-[var(--ac)]" />
          <span className="leading-snug">ছবিতে বাংলা উচ্চারণ দিন <span className="block text-[0.8125rem] text-ink2">স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি</span></span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {canShareImage && <button type="button" className={`${action} col-span-2 !border-gold bg-gold !text-on-gold`} onClick={shareImage}><Icon name="share" className="size-4" /> ছবি শেয়ার</button>}
          <button type="button" className={action} disabled={!image} onClick={saveImage}><Icon name="download" className="size-4" /> ছবি সেভ</button>
          <button type="button" className={action} onClick={onShareText}><Icon name="settings" className="size-4" /> লেখা শেয়ার</button>
        </div>
        <p role="status" className="text-center text-sm text-ink2 empty:hidden">{message}</p>
      </div>
    </dialog>,
    document.body,
  );
}
