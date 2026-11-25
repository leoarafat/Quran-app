"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { computeZakat, readAmount, type Metal, type Unit } from "@/lib/tools/zakat";

const FIELDS = ["gold", "goldPrice", "silver", "silverPrice", "cash", "business", "receivable", "debt"] as const;
type Field = (typeof FIELDS)[number];
const EMPTY = Object.fromEntries(FIELDS.map((f) => [f, ""])) as Record<Field, string>;

const taka = (n: number) => `৳ ${toBnDigits((Math.round(n * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 }))}`;
const METAL_NAMES: Record<Metal, string> = { gold: "সোনা", silver: "রুপা" };
const card = "space-y-3 rounded-[1.375rem] border border-line bg-surface p-4";
const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong"}`;

export function ZakatCalculator() {
  const [values, setValues] = useState(EMPTY);
  const [unit, setUnit] = useState<Unit>("vori");
  const [nisabBy, setNisabBy] = useState<Metal>("silver");

  const numbers = Object.fromEntries(FIELDS.map((f) => [f, readAmount(values[f])])) as Record<Field, number | null>;
  const invalid = FIELDS.some((f) => numbers[f] === null);
  const result = invalid ? null : computeZakat({ unit, nisabBy, ...(numbers as Record<Field, number>) });
  const started = FIELDS.some((f) => values[f].trim() !== "");
  const unitName = unit === "vori" ? "ভরি" : "গ্রাম";

  const input = (field: Field, label: string, suffix: string) => (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-muted">
      {label}
      <span className={`flex min-h-12 items-center gap-2 rounded-2xl border bg-bg px-3 ${numbers[field] === null ? "border-accent" : "border-line-strong"}`}>
        <input inputMode="decimal" autoComplete="off" placeholder="০" value={values[field]} aria-invalid={numbers[field] === null} onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))} className="min-w-0 flex-1 bg-transparent text-lg text-text outline-none" />
        <span aria-hidden className="shrink-0">{suffix}</span>
      </span>
      {numbers[field] === null && <span role="alert" className="text-accent">শুধু সংখ্যা লিখুন</span>}
    </label>
  );

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <section className={card}>
        <h2 className="font-display font-semibold">সোনা ও রুপা</h2>
        <div role="group" aria-label="ওজনের একক" className="grid grid-cols-2 gap-2">
          {([["vori", "ভরি"], ["gram", "গ্রাম"]] as const).map(([key, label]) => (
            // Weights and prices belong to the unit they were typed in, so changing it clears them.
            <button key={key} type="button" aria-pressed={unit === key} className={chip(unit === key)} onClick={() => { if (unit !== key) { setUnit(key); setValues((v) => ({ ...v, gold: "", goldPrice: "", silver: "", silverPrice: "" })); } }}>{label}</button>
          ))}
        </div>
        <div className="grid gap-3 min-[26rem]:grid-cols-2">
          {input("gold", "আপনার সোনা", unitName)}
          {input("goldPrice", `প্রতি ${unitName} সোনার আজকের দাম`, "৳")}
          {input("silver", "আপনার রুপা", unitName)}
          {input("silverPrice", `প্রতি ${unitName} রুপার আজকের দাম`, "৳")}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-display font-semibold">টাকা ও অন্যান্য সম্পদ</h2>
        {input("cash", "নগদ, ব্যাংক ও মোবাইল ব্যাংকিং", "৳")}
        {input("business", "বিক্রির জন্য রাখা ব্যবসার পণ্যের বর্তমান দাম", "৳")}
        {input("receivable", "অন্যের কাছে পাওনা, যা ফেরত পাওয়ার আশা আছে", "৳")}
        {input("debt", "বাদ যাবে: এখন পরিশোধযোগ্য দেনা", "৳")}
      </section>

      <section className={card}>
        <h2 className="font-display font-semibold">নিসাব কোন হিসাবে?</h2>
        <div role="group" aria-label="নিসাবের হিসাব" className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={nisabBy === "silver"} className={chip(nisabBy === "silver")} onClick={() => setNisabBy("silver")}>রুপা (৫২.৫ ভরি)</button>
          <button type="button" aria-pressed={nisabBy === "gold"} className={chip(nisabBy === "gold")} onClick={() => setNisabBy("gold")}>সোনা (৭.৫ ভরি)</button>
        </div>
        <p className="text-sm leading-relaxed text-muted">কোনটি আপনার জন্য প্রযোজ্য, তা আলেমের কাছে জেনে নিন।</p>
      </section>

      <section aria-label="ফলাফল" className="rounded-[1.375rem] border border-gold bg-active p-4">
        <div aria-live="polite">
          {invalid ? (
            <p>লাল দাগ দেওয়া ঘর ঠিক করুন।</p>
          ) : !result!.ready ? (
            <p>{started ? "" : "আপনার হিসাব লিখুন। "}{result!.needs.map((m) => METAL_NAMES[m]).join(" ও ")}র আজকের দাম লিখলে ফল দেখা যাবে।</p>
          ) : (
            <dl className="space-y-1">
              {([["মোট সম্পদ", result!.assets], ["দেনা বাদে", result!.net], [`নিসাব (${METAL_NAMES[nisabBy]})`, result!.nisab]] as const).map(([label, amount]) => (
                <div key={label} className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted">{label}</dt><dd>{taka(amount)}</dd></div>
              ))}
              <div className="border-t border-line-strong pt-2 text-center">
                {result!.due ? (
                  <><dt className="text-muted">আনুমানিক যাকাত (২.৫%)</dt><dd className="font-display text-3xl font-bold text-accent">{taka(result!.zakat)}</dd></>
                ) : (
                  <><dt className="sr-only">ফল</dt><dd className="font-display text-lg font-semibold">সম্পদ নিসাবের কম</dd></>
                )}
              </div>
            </dl>
          )}
        </div>
      </section>

      <button type="button" className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-accent disabled:opacity-40" disabled={!started} onClick={() => setValues(EMPTY)}>
        <RotateCcw aria-hidden className="size-4" /> সব মুছুন
      </button>
    </form>
  );
}
