"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LETTERS, letterForms, makeQuestion, MARK_CARRIER, MARKS, type Example } from "@/lib/arabic/letters";
import { toBnDigits } from "@/lib/bn";

export type ShownExample = Example & { surahName: string };

const TABS = [["letters", "হরফ"], ["marks", "হরকত"], ["practice", "অনুশীলন"]] as const;
const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
// Amiri Quran reaches far below its line, so every glyph is given room underneath.
const arabic = "font-arabic leading-[2]";

function Letters({ examples }: { examples: Record<string, ShownExample[]> }) {
  const [open, setOpen] = useState<number | null>(null);
  if (open === null) {
    return (
      <ul dir="rtl" className="grid grid-cols-4 gap-2 min-[30rem]:grid-cols-7">
        {LETTERS.map((letter, i) => (
          <li key={letter.ch}>
            <button type="button" onClick={() => { setOpen(i); window.scrollTo({ top: 0 }); }} className="flex w-full flex-col items-center justify-center rounded-2xl py-1.5 border border-line bg-surface hover:border-brand">
              <span lang="ar" className="pb-4 font-arabic text-3xl leading-[1.7]">{letter.ch}</span>
              <span dir="ltr" className="text-sm text-muted">{letter.name}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  const letter = LETTERS[open];
  const step = "flex min-h-12 flex-1 items-center justify-center gap-1 rounded-full border border-line-strong bg-surface disabled:opacity-35";
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(null)} className="flex min-h-11 items-center gap-1 text-accent"><ChevronLeft aria-hidden className="size-5" /> সব হরফ</button>
      <section className={`${card} text-center`}>
        <p lang="ar" dir="rtl" className={`${arabic} pb-12 text-8xl`}>{letter.ch}</p>
        <h2 className="font-display text-2xl font-semibold">{letter.name}</h2>
        <p className="text-sm text-muted">{toBnDigits(open + 1)}/{toBnDigits(LETTERS.length)}</p>
      </section>
      <section className={card}>
        <h3 className="mb-2 font-display font-semibold">শব্দের ভেতরে চেহারা</h3>
        <ul className="grid grid-cols-4 gap-2 text-center">
          {letterForms(letter).map((form) => (
            <li key={form.label} className="rounded-2xl border border-line-strong py-1">
              <span lang="ar" dir="rtl" className={`${arabic} block pb-5 text-4xl`}>{form.text}</span>
              <span className="block text-[0.75rem] leading-snug text-muted">{form.label}</span>
            </li>
          ))}
        </ul>
        {letter.breaks && <p className="mt-2 text-sm text-muted">এই হরফ পরের হরফের সাথে জোড়া লাগে না।</p>}
      </section>
      {examples[letter.ch]?.length > 0 && (
        <section className={card}>
          <h3 className="mb-1 font-display font-semibold">কুরআনের যেসব শব্দ এই হরফে শুরু</h3>
          <ul className="space-y-1">
            {examples[letter.ch].map((e) => (
              <li key={`${e.s}:${e.a}:${e.word}`} className="flex items-center justify-between gap-3 border-t border-line pt-1 first:border-0">
                <Link href={`/quran/${e.s}/#a${e.a}`} prefetch={false} className="flex min-h-11 items-center text-sm text-accent underline">{e.surahName} {toBnDigits(e.s)}:{toBnDigits(e.a)}</Link>
                <span lang="ar" dir="rtl" className={`${arabic} text-3xl`}>{e.word}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex gap-2">
        <button type="button" className={step} disabled={open === 0} onClick={() => setOpen(open - 1)}><ChevronLeft aria-hidden className="size-5" /> আগের হরফ</button>
        <button type="button" className={step} disabled={open === LETTERS.length - 1} onClick={() => setOpen(open + 1)}>পরের হরফ <ChevronRight aria-hidden className="size-5" /></button>
      </div>
    </div>
  );
}

function Marks() {
  return (
    <ul className="grid grid-cols-2 gap-2 min-[30rem]:grid-cols-4">
      {MARKS.map((m) => (
        <li key={m.name} className={`${card} text-center`}>
          <span lang="ar" dir="rtl" className="block pb-10 font-arabic text-6xl leading-[2.2]">{MARK_CARRIER + m.mark}</span>
          <span className="block font-semibold leading-snug">{m.name}</span>
        </li>
      ))}
    </ul>
  );
}

function Practice() {
  const [question, setQuestion] = useState(() => makeQuestion(Math.random, null));
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, asked: 0 });
  const answered = chosen !== null;

  const choose = (i: number) => {
    if (answered) return;
    setChosen(i);
    setScore((s) => ({ right: s.right + (i === question.answer ? 1 : 0), asked: s.asked + 1 }));
  };

  return (
    <section className={`${card} space-y-3 text-center`}>
      <p className="text-sm text-muted">সঠিক {toBnDigits(score.right)} / {toBnDigits(score.asked)}</p>
      <h2 className="font-display font-semibold">এটি কোন হরফ?</h2>
      <p lang="ar" dir="rtl" className={`${arabic} pb-12 text-8xl`}>{LETTERS[question.answer].ch}</p>
      <div className="grid grid-cols-2 gap-2">
        {question.choices.map((i) => {
          const right = answered && i === question.answer;
          const wrong = answered && i === chosen && i !== question.answer;
          return (
            <button key={i} type="button" aria-disabled={answered} onClick={() => choose(i)} className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-2 font-semibold ${right ? "border-gold bg-gold text-on-gold" : wrong ? "border-dashed border-accent text-muted" : "border-line-strong"}`}>
              {right && <Check aria-label="সঠিক" className="size-5" />}
              {wrong && <X aria-label="ভুল" className="size-5" />}
              {LETTERS[i].name}
            </button>
          );
        })}
      </div>
      <p role="status" className="min-h-6">{!answered ? "" : chosen === question.answer ? "সঠিক হয়েছে" : `ভুল। এটি “${LETTERS[question.answer].name}”`}</p>
      <button type="button" disabled={!answered} className="min-h-12 w-full rounded-full border border-brand bg-brand font-semibold text-on-brand disabled:opacity-40" onClick={() => { setQuestion(makeQuestion(Math.random, question.answer)); setChosen(null); }}>পরের প্রশ্ন</button>
    </section>
  );
}

export function ArabicLessons({ examples }: { examples: Record<string, ShownExample[]> }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("letters");
  return (
    <div className="space-y-4">
      <div role="group" aria-label="পাঠ" className="grid grid-cols-3 gap-2">
        {TABS.map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} className={chip(tab === key)} onClick={() => setTab(key)}>{label}</button>)}
      </div>
      {tab === "letters" ? <Letters examples={examples} /> : tab === "marks" ? <Marks /> : <Practice />}
    </div>
  );
}
