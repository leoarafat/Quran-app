"use client";

import { Seg } from "@/components/ui/Seg";
import { Toggle } from "@/components/ui/Toggle";
import { toBnDigits } from "@/lib/bn";
import { BN_FONT_LABELS, LINE_HEIGHTS, modeOf, READING_MODES, toggleLayer, type ReaderPrefs } from "@/lib/reader/prefs";
import type { Ayah } from "@/lib/quran/types";
import { BN_FONTS, SCALE_MAX, SCALE_MIN, THEME_LABELS, THEMES, type Theme } from "@/lib/settings";
import { updateSettings, useSettings } from "@/lib/useSettings";

/** Each swatch shows its own theme, whichever one is on. */
const SWATCH: Record<Theme, string> = { paper: "bg-[#f6f1e6] text-[#12201a]", sepia: "bg-[#eaddbf] text-[#33281a]", night: "bg-[#0a1511] text-[#e7efe8]", amoled: "bg-black text-[#edede8]" };
const GAPS = [{ value: "tight", text: "কম" }, { value: "normal", text: "মাঝারি" }, { value: "wide", text: "বেশি" }] as const;

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm"><span>{label}</span><b className="tabular-nums">{toBnDigits(Math.round(value * 100))}%</b></span>
      <input type="range" aria-label={label} min={SCALE_MIN} max={SCALE_MAX} step={0.1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="slider h-11 w-full" style={{ "--filled": `${((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100}%` } as React.CSSProperties} />
    </label>
  );
}

export function ReaderSettings({ prefs, onChange, sample, compact = false }: { prefs: ReaderPrefs; onChange: (next: ReaderPrefs) => void; /** the ayah being read, for the preview */ sample: Ayah; /** the narrow desktop panel */ compact?: boolean }) {
  const settings = useSettings();
  const mode = modeOf(prefs);
  const group = (title: string, children: React.ReactNode) => <div className="space-y-2"><p className="text-sm">{title}</p>{children}</div>;

  return (
    <div className="space-y-4">
      {/* The preview shows exactly what the chosen layers, sizes and spacing look like. */}
      <div className="max-h-56 overflow-y-auto rounded-md border border-ln bg-bg px-4 py-2" style={{ "--ar-lh": LINE_HEIGHTS[prefs.lineGap] } as React.CSSProperties}>
        {(prefs.arabic || prefs.mushaf) && <p lang="ar" dir="rtl" className="font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[var(--ar-lh)]">{sample.ar}</p>}
        {!prefs.mushaf && !compact && prefs.pronunciation && <p className="reading text-[calc(0.875rem*var(--bn-scale))] text-gt">{sample.tr}</p>}
        {!prefs.mushaf && !compact && prefs.translation && <p className="reading text-[calc(1rem*var(--bn-scale))]">{sample.bn}</p>}
      </div>

      {group("পড়ার ধরন", (
        <div role="group" aria-label="পড়ার ধরন" className="grid grid-cols-2 gap-1 rounded-xl bg-ln p-[3px]">
          {READING_MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => onChange({ ...prefs, ...m.prefs })} className={`min-h-11 rounded-[0.625rem] px-1 text-sm ${mode === m.id ? "bg-sf font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_0_0_1px_var(--ln2)]" : "text-ink2"}`}>{m.label}</button>
          ))}
        </div>
      ))}

      <Slider label="আরবি সাইজ" value={settings.arScale} onChange={(arScale) => updateSettings({ arScale })} />
      <Slider label="বাংলা সাইজ" value={settings.bnScale} onChange={(bnScale) => updateSettings({ bnScale })} />
      <p className="hidden text-[0.8125rem] text-ink2 [@media(pointer:coarse)]:block">লেখার ওপর দুই আঙুল ছড়িয়ে বা কাছে এনেও সাইজ বদলানো যায়।</p>

      {group(settings.theme === "system" ? "থিম (এখন ফোনের থিম অনুযায়ী)" : "থিম", (
        <div role="group" aria-label="থিম" className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
          {THEMES.map((theme) => (
            <button key={theme} type="button" aria-pressed={settings.theme === theme} onClick={() => updateSettings({ theme })} className={`h-13 rounded-[0.875rem] text-[0.8125rem] ${SWATCH[theme]} ${settings.theme === theme ? "border-2 border-ac font-semibold ring-2 ring-ac/40" : "border border-ln2"}`}>{THEME_LABELS[theme]}</button>
          ))}
        </div>
      ))}

      {group("আরবি লাইনের ফাঁক", <Seg label="আরবি লাইনের ফাঁক" options={GAPS} value={prefs.lineGap} onChange={(lineGap) => onChange({ ...prefs, lineGap })} />)}

      <div>
        {!prefs.mushaf && (
          <>
            <Toggle label="আরবি" checked={prefs.arabic} onChange={() => onChange({ ...prefs, ...toggleLayer(prefs, "arabic") })} />
            <Toggle label="উচ্চারণ" checked={prefs.pronunciation} onChange={() => onChange({ ...prefs, ...toggleLayer(prefs, "pronunciation") })} />
            <Toggle label="অনুবাদ" checked={prefs.translation} onChange={() => onChange({ ...prefs, ...toggleLayer(prefs, "translation") })} />
            <Toggle label="আয়াত নম্বর" checked={prefs.numbers} onChange={(numbers) => onChange({ ...prefs, numbers })} />
          </>
        )}
        <Toggle label="তিলাওয়াতের সাথে পাতা চলবে" checked={prefs.follow} onChange={(follow) => onChange({ ...prefs, follow })} />
      </div>

      {!prefs.mushaf && group("বাংলা ফন্ট", <Seg label="বাংলা ফন্ট" options={BN_FONTS.map((f) => ({ value: f, text: BN_FONT_LABELS[f] }))} value={settings.bnFont} onChange={(bnFont) => updateSettings({ bnFont })} />)}

      <p className="flex min-h-12 items-center justify-between gap-3 border-t border-ln pt-2">
        <span>অনুবাদ</span><span className="text-right text-[0.8125rem] text-ink2">বাংলা · রুওয়্যাদ অনুবাদ কেন্দ্র</span>
      </p>
    </div>
  );
}
