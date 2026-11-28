"use client";

import Link from "next/link";
import { useState } from "react";
import { LETTERS, letterForms, makeQuestion, MARK_CARRIER, MARKS, type Example } from "@/lib/arabic/letters";
import { toBnDigits } from "@/lib/bn";
import { Icon } from "@/components/ui/Icon";
import { LetterAudio } from "./LetterAudio";
import { NewBadge } from "@/components/NewBadge";
import { WritingBoard } from "./WritingBoard";

export type ShownExample = Example & { surahName: string };

const TABS = [["letters", "হরফ"], ["marks", "হরকত"], ["practice", "অনুশীলন"], ["write", "লেখা"]] as const;
const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-ac bg-ac font-semibold text-on-ac" : "border-ln2 bg-sf"}`;
const card = "rounded-md border border-ln bg-sf p-4";
// Amiri Quran reaches far below its line, so every glyph is given room underneath.
const arabic = "font-arabic leading-[2]";

function Letters({ examples }: { examples: Record<string, ShownExample[]> }) {
  const [open, setOpen] = useState<number | null>(null);
  if (open === null) {
    return (
      <ul dir="rtl" className="grid grid-cols-4 gap-2 min-[30rem]:grid-cols-7">
        {LETTERS.map((letter, i) => (
          <li key={letter.ch}>
            <button type="button" onClick={() => { setOpen(i); window.scrollTo({ top: 0 }); }} className="flex w-full flex-col items-center justify-center rounded-2xl py-1.5 border border-ln bg-sf hover:border-ac">
              <span lang="ar" className="pb-4 font-arabic text-3xl leading-[1.7]">{letter.ch}</span>
              <span dir="ltr" className="text-sm text-ink2">{letter.name}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  const letter = LETTERS[open];
  const step = "flex min-h-12 flex-1 items-center justify-center gap-1 rounded-full border border-ln2 bg-sf disabled:opacity-35";
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(null)} className="flex min-h-11 items-center gap-1 text-gt"><Icon name="back" className="size-5" /> সব হরফ</button>
      <section className={`${card} text-center`}>
        <p lang="ar" dir="rtl" className={`${arabic} pb-12 text-8xl`}>{letter.ch}</p>
        <h2 className="font-display text-2xl font-semibold">{letter.name}</h2>
        <p className="text-sm text-ink2">{toBnDigits(open + 1)}/{toBnDigits(LETTERS.length)}</p>
        <LetterAudio key={letter.ch} letter={letter.ch} name={letter.name} />
      </section>
      <section className={card}>
        <h3 className="mb-2 font-display font-semibold">শব্দের ভেতরে চেহারা</h3>
        <ul className="grid grid-cols-4 gap-2 text-center">
          {letterForms(letter).map((form) => (
            <li key={form.label} className="rounded-2xl border border-ln2 py-1">
              <span lang="ar" dir="rtl" className={`${arabic} block pb-5 text-4xl`}>{form.text}</span>
              <span className="block text-[0.75rem] leading-snug text-ink2">{form.label}</span>
            </li>
          ))}
        </ul>
        {letter.breaks && <p className="mt-2 text-sm text-ink2">এই হরফ পরের হরফের সাথে জোড়া লাগে না।</p>}
      </section>
      {examples[letter.ch]?.length > 0 && (
        <section className={card}>
          <h3 className="mb-1 font-display font-semibold">কুরআনের যেসব শব্দ এই হরফে শুরু</h3>
          <ul className="space-y-1">
            {examples[letter.ch].map((e) => (
              <li key={`${e.s}:${e.a}:${e.word}`} className="flex items-center justify-between gap-3 border-t border-ln pt-1 first:border-0">
                <Link href={`/quran/${e.s}/#a${e.a}`} prefetch={false} className="flex min-h-11 items-center text-sm text-gt underline">{e.surahName} {toBnDigits(e.s)}:{toBnDigits(e.a)}</Link>
                <span lang="ar" dir="rtl" className={`${arabic} text-3xl`}>{e.word}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex gap-2">
        <button type="button" className={step} disabled={open === 0} onClick={() => setOpen(open - 1)}><Icon name="back" className="size-5" /> আগের হরফ</button>
        <button type="button" className={step} disabled={open === LETTERS.length - 1} onClick={() => setOpen(open + 1)}>পরের হরফ <Icon name="chev" className="size-5" /></button>
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
      <p className="text-sm text-ink2">সঠিক {toBnDigits(score.right)} / {toBnDigits(score.asked)}</p>
      <h2 className="font-display font-semibold">এটি কোন হরফ?</h2>
      <p lang="ar" dir="rtl" className={`${arabic} pb-12 text-8xl`}>{LETTERS[question.answer].ch}</p>
      <div className="grid grid-cols-2 gap-2">
        {question.choices.map((i) => {
          const right = answered && i === question.answer;
          const wrong = answered && i === chosen && i !== question.answer;
          return (
            <button key={i} type="button" aria-disabled={answered} onClick={() => choose(i)} className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-2 font-semibold ${right ? "border-gold bg-gold text-on-gold" : wrong ? "border-dashed border-gt text-ink2" : "border-ln2"}`}>
              {right && <Icon name="check" aria-label="সঠিক" className="size-5" />}
              {wrong && <Icon name="close" aria-label="ভুল" className="size-5" />}
              {LETTERS[i].name}
            </button>
          );
        })}
      </div>
      <p role="status" className="min-h-6">{!answered ? "" : chosen === question.answer ? "সঠিক হয়েছে" : `ভুল। এটি “${LETTERS[question.answer].name}”`}</p>
      <button type="button" disabled={!answered} className="min-h-12 w-full rounded-full border border-ac bg-ac font-semibold text-on-ac disabled:opacity-40" onClick={() => { setQuestion(makeQuestion(Math.random, question.answer)); setChosen(null); }}>পরের প্রশ্ন</button>
    </section>
  );
}

export function ArabicLessons({ examples }: { examples: Record<string, ShownExample[]> }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("letters");
  return (
    <div className="space-y-4">
      <div role="group" aria-label="পাঠ" className="grid grid-cols-4 gap-2">
        {TABS.map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} className={`relative ${chip(tab === key).replace("px-3", "px-1 max-[23rem]:text-sm")}`} onClick={() => setTab(key)}>{label}{key === "write" && <span className="absolute -right-1 -top-2.5"><NewBadge /></span>}</button>)}
      </div>
      {tab === "letters" ? <Letters examples={examples} /> : tab === "marks" ? <Marks /> : tab === "practice" ? <Practice /> : <WritingBoard />}
    </div>
  );
}
