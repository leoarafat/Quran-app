"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { HeroCard } from "@/components/ui/HeroCard";
import { Seg } from "@/components/ui/Seg";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { computeZakat, readAmount, type Metal, type Unit, type ZakatResult } from "@/lib/tools/zakat";

const FIELDS = ["gold", "goldPrice", "silver", "silverPrice", "cash", "business", "receivable", "debt"] as const;
type Field = (typeof FIELDS)[number];
const EMPTY = Object.fromEntries(FIELDS.map((f) => [f, ""])) as Record<Field, string>;

const taka = (n: number) => `৳ ${toBnDigits((Math.round(n * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 }))}`;
const METAL_NAMES: Record<Metal, string> = { gold: "সোনা", silver: "রুপা" };
const card = "rounded-md border border-ln bg-sf p-4 shadow-card";
const main = "flex min-h-13 flex-[2] items-center justify-center rounded-full bg-ac px-4 font-semibold text-on-ac disabled:opacity-40";
const other = "flex min-h-13 flex-1 items-center justify-center rounded-full border border-ac/40 px-4 font-semibold text-ac";

const STEPS = ["সোনা ও রুপা", "টাকা ও অন্য সম্পদ", "দেনা", "নিসাব"] as const;
/** Which boxes belong to each step, so that a bad number is caught before moving on. */
const BOXES: Field[][] = [["gold", "goldPrice", "silver", "silverPrice"], ["cash", "business", "receivable"], ["debt"], []];

export function ZakatCalculator() {
  const [values, setValues] = useState(EMPTY);
  const [unit, setUnit] = useState<Unit>("vori");
  const [nisabBy, setNisabBy] = useState<Metal>("silver");
  /** 0..3 are the steps; 4 is the result */
  const [step, setStep] = useState(0);

  const numbers = Object.fromEntries(FIELDS.map((f) => [f, readAmount(values[f])])) as Record<Field, number | null>;
  const invalid = FIELDS.some((f) => numbers[f] === null);
  const result: ZakatResult | null = invalid ? null : computeZakat({ unit, nisabBy, ...(numbers as Record<Field, number>) });
  const started = FIELDS.some((f) => values[f].trim() !== "");
  const unitName = unit === "vori" ? "ভরি" : "গ্রাম";
  const stepInvalid = BOXES[step]?.some((f) => numbers[f] === null) ?? false;

  const input = (field: Field, label: string, suffix: string) => (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold">
      {label}
      <span className={`flex min-h-13 items-center gap-2 rounded-md border bg-sf px-3.5 focus-within:border-ac ${numbers[field] === null ? "border-gt" : "border-ln2"}`}>
        <input inputMode="decimal" autoComplete="off" placeholder="০" value={values[field]} aria-invalid={numbers[field] === null} onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))} className="quiet-focus min-w-0 flex-1 self-stretch bg-transparent text-lg font-normal text-ink" />
        <span aria-hidden="true" className="shrink-0 font-normal text-ink2">{suffix}</span>
      </span>
      {numbers[field] === null && <span role="alert" className="font-normal text-gt">শুধু সংখ্যা লিখুন</span>}
    </label>
  );

  const reset = () => {
    setValues(EMPTY);
    setStep(0);
  };

  if (step === STEPS.length && result) {
    const lines = result.ready ? [["মোট সম্পদ", result.assets], ["দেনা (বাদ)", numbers.debt!], ["দেনা বাদে", result.net], [`নিসাব (${METAL_NAMES[nisabBy]})`, result.nisab]] as const : [];
    const share = async () => {
      if (!result.ready) return;
      const text = `যাকাতের আনুমানিক হিসাব\n${lines.map(([l, n]) => `${l}: ${taka(n)}`).join("\n")}\n${result.due ? `আনুমানিক যাকাত (২.৫%): ${taka(result.zakat)}` : "সম্পদ নিসাবের কম"}\nএই হিসাব আলেমের যাচাই করা নয়।`;
      try {
        if (navigator.share) await navigator.share({ text });
        else {
          await navigator.clipboard.writeText(text);
          showToast("হিসাব কপি হয়েছে");
        }
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") showToast("শেয়ার করা যায়নি");
      }
    };
    return (
      <div className="space-y-4">
        <div aria-live="polite">
          {!result.ready ? (
            <p className="rounded-md bg-gs p-4">{result.needs.map((m) => METAL_NAMES[m]).join(" ও ")}র আজকের দাম লিখলে ফল দেখা যাবে। “সোনা ও রুপা” ধাপে ফিরে দাম লিখুন।</p>
          ) : (
            <HeroCard label="ফলাফল">
              <p className="text-[0.8125rem] text-hero-muted">{result.due ? "আনুমানিক যাকাত (২.৫%)" : "ফল"}</p>
              <p className="break-words text-4xl font-bold tabular-nums text-hero-accent">{result.due ? taka(result.zakat) : "সম্পদ নিসাবের কম"}</p>
            </HeroCard>
          )}
        </div>
        {result.ready && (
          <dl className={`${card} !py-1`}>
            {lines.map(([label, amount]) => <div key={label} className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 border-b border-ln last:border-0"><dt>{label}</dt><dd className="font-semibold tabular-nums">{taka(amount)}</dd></div>)}
          </dl>
        )}
        <p className="text-sm text-ink2">হিসাব সহায়ক মাত্র, আলেমের যাচাই করা নয়। জটিল ক্ষেত্রে আলেমের পরামর্শ নিন। এই সংখ্যাগুলো সেভ হয় না; পাতা ছাড়লে মুছে যাবে।</p>
        <div className="flex gap-3">
          <button type="button" className={other} onClick={() => setStep(0)}>সংখ্যা বদলান</button>
          {result.ready ? <button type="button" className={main} onClick={() => void share()}>শেয়ার</button> : null}
        </div>
        <Chip className="w-full" onClick={reset}>সব মুছে নতুন হিসাব</Chip>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!stepInvalid) setStep((s) => s + 1); }}>
      <div>
        <div aria-hidden="true" className="flex gap-1.5">{STEPS.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gd" : "bg-ln"}`} />)}</div>
        <h2 aria-live="polite" className="mt-2 text-sm text-ink2">ধাপ {toBnDigits(step + 1)} / {toBnDigits(STEPS.length)} · <b className="text-ink">{STEPS[step]}</b></h2>
      </div>

      {step === 0 && (
        <>
          {/* Weights and prices belong to the unit they were typed in, so changing it clears them. */}
          <Seg label="ওজনের একক" options={[{ value: "vori", text: "ভরি" }, { value: "gram", text: "গ্রাম" }]} value={unit} onChange={(next) => { if (unit !== next) { setUnit(next); setValues((v) => ({ ...v, gold: "", goldPrice: "", silver: "", silverPrice: "" })); } }} />
          {input("gold", "আপনার সোনা", unitName)}
          {input("goldPrice", `প্রতি ${unitName} সোনার আজকের দাম`, "৳")}
          {input("silver", "আপনার রুপা", unitName)}
          {input("silverPrice", `প্রতি ${unitName} রুপার আজকের দাম`, "৳")}
        </>
      )}
      {step === 1 && (
        <>
          {input("cash", "নগদ, ব্যাংক ও মোবাইল ব্যাংকিং", "৳")}
          {input("business", "বিক্রির জন্য রাখা ব্যবসার পণ্যের বর্তমান দাম", "৳")}
          {input("receivable", "অন্যের কাছে পাওনা, যা ফেরত পাওয়ার আশা আছে", "৳")}
        </>
      )}
      {step === 2 && input("debt", "বাদ যাবে: এখন পরিশোধযোগ্য দেনা", "৳")}
      {step === 3 && (
        <div className="space-y-3 rounded-md bg-gs p-4">
          <p className="font-semibold">নিসাব কোন হিসাবে?</p>
          <Seg label="নিসাবের হিসাব" options={[{ value: "silver", text: "রুপা (৫২.৫ ভরি)" }, { value: "gold", text: "সোনা (৭.৫ ভরি)" }]} value={nisabBy} onChange={setNisabBy} />
          <p className="text-sm leading-relaxed">কোনটি আপনার জন্য প্রযোজ্য, তা আলেমের কাছে জেনে নিন।</p>
          {result && !result.ready && <p role="alert" className="text-sm text-gt">ফল দেখতে প্রথম ধাপে {result.needs.map((m) => METAL_NAMES[m]).join(" ও ")}র আজকের দাম লিখতে হবে।</p>}
        </div>
      )}

      <div className="flex gap-3">
        {step > 0 && <button type="button" className={other} onClick={() => setStep((s) => s - 1)}>আগের ধাপ</button>}
        <button type="submit" className={main} disabled={stepInvalid}>{step === STEPS.length - 1 ? "ফল দেখুন" : "পরের ধাপ"}</button>
      </div>
      {started && <button type="button" className="mx-auto flex min-h-11 items-center px-3 text-sm font-semibold text-ac" onClick={reset}>সব মুছুন</button>}
    </form>
  );
}
