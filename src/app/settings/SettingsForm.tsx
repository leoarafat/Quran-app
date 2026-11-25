"use client";

import { toBnDigits } from "@/lib/bn";
import { SCALE_MAX, SCALE_MIN, THEMES, type Theme } from "@/lib/settings";
import { updateSettings, useSettings } from "@/lib/useSettings";

const THEME_LABELS: Record<Theme, string> = { light: "দিন", sepia: "সেপিয়া", dark: "রাত" };

function ScaleSlider({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold">{label}</label>
        <span className="text-muted">{toBnDigits(Math.round(value * 100))}%</span>
      </div>
      <input
        id={id} type="range" min={SCALE_MIN} max={SCALE_MAX} step={0.1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-[var(--brand)]"
      />
    </div>
  );
}

export function SettingsForm() {
  const settings = useSettings();
  const card = "rounded-[1.375rem] border border-line bg-surface p-4";
  return (
    <div className="max-w-xl space-y-4">
      <fieldset className={card}>
        <legend className="sr-only">থিম</legend>
        <p aria-hidden className="mb-2 font-semibold">থিম</p>
        <div className="grid grid-cols-3 gap-2">
          {[...THEMES].reverse().map((theme) => (
            <label key={theme} className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-line has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-3 has-focus-visible:outline-accent">
              <input type="radio" name="theme" className="sr-only" checked={settings.theme === theme} onChange={() => updateSettings({ theme })} />
              {THEME_LABELS[theme]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={`${card} flex min-h-16 cursor-pointer items-center gap-3`}>
        <span className="flex-1">
          <span className="block font-semibold">সহজ মোড</span>
          <span className="block text-sm text-muted">সব লেখা ও বাটন বড় হবে</span>
        </span>
        <input type="checkbox" className="size-7 accent-[var(--brand)]" checked={settings.easyMode} onChange={(e) => updateSettings({ easyMode: e.target.checked })} />
      </label>

      <div className={`${card} space-y-3`}>
        <ScaleSlider id="ar-scale" label="আরবি লেখার সাইজ" value={settings.arScale} onChange={(arScale) => updateSettings({ arScale })} />
        <ScaleSlider id="bn-scale" label="কুরআনের বাংলা লেখার সাইজ" value={settings.bnScale} onChange={(bnScale) => updateSettings({ bnScale })} />
        <p className="text-sm text-muted">এই দুটি সাইজ কুরআন রিডারে কাজ করবে।</p>
      </div>
    </div>
  );
}
