"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import type { Template } from "@/lib/tools/planTemplates";
import { maxDays, ordinal, pageOf, validRef, type Layout, type ReadingPlan, type Ref } from "@/lib/tools/planner";
import { refText, solid } from "./shared";

type New = Omit<ReadingPlan, "id" | "start" | "done">;
type Common = { layout: Layout; names: string[]; onCreate: (p: New) => void; onClose: () => void };

const perDay = (layout: Layout, from: Ref, to: Ref, days: number) => Math.max(1, Math.round((pageOf(layout, to) - pageOf(layout, from) + 1) / days));

export function TemplateSheet({ template: t, layout, names, onCreate, onClose }: Common & { template: Template }) {
  const rows: [string, string][] = [
    ["সময়", `${toBnDigits(t.days)} দিন`],
    ["থেকে", refText(names, t.from)],
    ["পর্যন্ত", refText(names, t.to)],
    ["প্রতিদিন", `গড়ে প্রায় ${toBnDigits(perDay(layout, t.from, t.to, t.days))} পৃষ্ঠা বা তার অংশ`],
  ];
  return (
    <BottomSheet title={t.name} onClose={onClose}>
      <p className="leading-relaxed">{t.about}</p>
      <dl className="divide-y divide-ln rounded-md border border-ln px-4">
        {rows.map(([k, v]) => <div key={k} className="flex min-h-12 items-center justify-between gap-4 py-1.5"><dt className="text-ink2">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
      </dl>
      <button type="button" className={solid} onClick={() => onCreate({ name: t.name, days: t.days, from: t.from, to: t.to })}>এখনই শুরু করুন</button>
    </BottomSheet>
  );
}

const field = "min-h-12 w-full min-w-0 rounded-md border border-ln2 bg-bg px-3 text-ink";

function RefField({ label, value, layout, names, onChange }: { label: string; value: { s: number; a: string }; layout: Layout; names: string[]; onChange: (v: { s: number; a: string }) => void }) {
  return (
    <fieldset>
      <legend className="mb-1 font-semibold">{label}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
        <select aria-label={`${label}: সূরা`} value={value.s} className={field} onChange={(e) => { const s = Number(e.target.value); onChange({ s, a: label === "থেকে" ? "১" : toBnDigits(layout.counts[s - 1]) }); }}>
          {names.map((n, i) => <option key={n} value={i + 1}>{toBnDigits(i + 1)}. {n}</option>)}
        </select>
        <input inputMode="numeric" aria-label={`${label}: আয়াত নম্বর`} value={value.a} className={field} onChange={(e) => onChange({ s: value.s, a: e.target.value })} />
      </div>
    </fieldset>
  );
}

export function CustomSheet({ layout, names, onCreate, onClose }: Common) {
  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [from, setFrom] = useState({ s: 1, a: "১" });
  const [to, setTo] = useState({ s: 114, a: "৬" });
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = (text: string) => Number(toAsciiDigits(text.trim()));
    const a: Ref = { s: from.s, a: number(from.a) };
    const b: Ref = { s: to.s, a: number(to.a) };
    for (const [label, r] of [["শুরুর", a], ["শেষের", b]] as const) {
      if (!validRef(layout, r)) return setError(`${label} আয়াত নম্বর ১ থেকে ${toBnDigits(layout.counts[r.s - 1])}-এর মধ্যে লিখুন`);
    }
    if (ordinal(layout, b) < ordinal(layout, a)) return setError("শেষের আয়াতটি শুরুর আয়াতের আগে পড়েছে");
    const most = maxDays(layout, a, b);
    const n = number(days);
    if (!Number.isInteger(n) || n < 1 || n > most) return setError(`দিনের সংখ্যা ১ থেকে ${toBnDigits(most)}-এর মধ্যে লিখুন`);
    onCreate({ name: name.trim() || "আমার প্ল্যান", days: n, from: a, to: b });
  };

  return (
    <BottomSheet title="নতুন প্ল্যান" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        <label className="block"><span className="mb-1 block font-semibold">প্ল্যানের নাম</span><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="যেমন: ফজরের পরে তিলাওয়াত" className={field} /></label>
        <label className="block"><span className="mb-1 block font-semibold">কত দিনে</span><input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} placeholder="যেমন: ৩০" className={field} /></label>
        <RefField label="থেকে" value={from} layout={layout} names={names} onChange={setFrom} />
        <RefField label="পর্যন্ত" value={to} layout={layout} names={names} onChange={setTo} />
        <p role="alert" className="text-sm font-semibold text-gt empty:hidden">{error}</p>
        <button type="submit" className={solid}>প্ল্যান শুরু করুন</button>
      </form>
    </BottomSheet>
  );
}
