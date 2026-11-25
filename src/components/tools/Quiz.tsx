"use client";

import { useState } from "react";
import { Award, Check, Lock, X } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { badges, LEVELS, makeQuiz, parseScores, QUESTIONS, record, seeded, type Level, type Question, type QuizSurah } from "@/lib/tools/quiz";
import { dayKey } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const KEY = "noor.quiz.v1";
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const solid = "min-h-12 w-full rounded-full border border-brand bg-brand px-4 font-semibold text-on-brand";

type Game = { questions: Question[]; id: { level: Level } | { day: string }; at: number; picked: number | null; score: number };

function Inner({ surahs }: { surahs: QuizSurah[] }) {
  const scores = useStored(KEY, parseScores);
  const [game, setGame] = useState<Game | null>(null);
  const [now] = useState(() => new Date());
  const today = dayKey(now);
  const run = streak(now, (d) => scores.daily[d] !== undefined);

  const begin = (id: Game["id"]) => {
    const questions = "day" in id ? makeQuiz(surahs, "medium", seeded(id.day)) : makeQuiz(surahs, id.level, seeded(`${id.level}-${Date.now()}`));
    setGame({ questions, id, at: 0, picked: null, score: 0 });
  };

  if (!game) {
    return (
      <div className="space-y-4">
        <section className={card}>
          <h2 className="font-display text-lg font-semibold">আজকের কুইজ</h2>
          <p className="mb-3 text-sm text-muted">টানা {toBnDigits(run)} দিন{scores.daily[today] !== undefined && ` · আজকের ফল ${toBnDigits(scores.daily[today])}/${toBnDigits(QUESTIONS)}`}</p>
          <button type="button" className={solid} onClick={() => begin({ day: today })}>{scores.daily[today] === undefined ? "শুরু করুন" : "আবার চর্চা করুন"}</button>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold">লেভেল</h2>
          {LEVELS.map((l) => (
            <button key={l.id} type="button" onClick={() => begin({ level: l.id })} className={`${card} flex w-full items-center justify-between gap-3 text-left hover:border-brand`}>
              <span><span className="block font-display font-semibold">{l.name}</span><span className="block text-sm text-muted">{l.hint}</span></span>
              <span className="shrink-0 text-sm text-accent">{scores.best[l.id] === undefined ? "খেলা হয়নি" : `সেরা ${toBnDigits(scores.best[l.id]!)}/${toBnDigits(QUESTIONS)}`}</span>
            </button>
          ))}
        </section>
        <section className={card}>
          <h2 className="mb-2 font-display font-semibold">ব্যাজ</h2>
          <ul className="space-y-2">
            {badges(scores, run).map((b) => (
              <li key={b.name} className={`flex items-center gap-2 ${b.earned ? "font-semibold text-accent" : "text-muted"}`}>
                {b.earned ? <Award aria-hidden className="size-5" /> : <Lock aria-hidden className="size-5" />}{b.name}<span className="sr-only">{b.earned ? " (পেয়েছেন)" : " (বাকি)"}</span>
              </li>
            ))}
          </ul>
        </section>
        <p className="text-sm text-muted">সব প্রশ্ন সূরার তালিকার তথ্য (Tanzil) থেকে অ্যাপ নিজে তৈরি করে।</p>
      </div>
    );
  }

  if (game.at >= game.questions.length) {
    return (
      <div className={`${card} space-y-3 text-center`}>
        <p className="font-display text-lg">আপনার ফল</p>
        <p role="status" className="font-display text-5xl font-bold text-accent">{toBnDigits(game.score)}/{toBnDigits(game.questions.length)}</p>
        <button type="button" className={solid} onClick={() => setGame(null)}>কুইজের তালিকায় ফিরুন</button>
      </div>
    );
  }

  const question = game.questions[game.at];
  const answered = game.picked !== null;
  const next = () => {
    if (game.at + 1 === game.questions.length) writeStored(KEY, JSON.stringify(record(scores, game.score, game.id)));
    setGame({ ...game, at: game.at + 1, picked: null });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted">প্রশ্ন {toBnDigits(game.at + 1)}/{toBnDigits(game.questions.length)}</p>
        <button type="button" className="min-h-11 px-2 text-accent underline" onClick={() => setGame(null)}>বন্ধ করুন</button>
      </div>
      <h2 className={`${card} font-display text-lg font-semibold`}>{question.text}</h2>
      <ul className="space-y-2">
        {question.options.map((option, i) => {
          const right = answered && i === question.answer;
          const wrong = answered && i === game.picked && !right;
          return (
            <li key={option}>
              <button type="button" disabled={answered} onClick={() => setGame({ ...game, picked: i, score: game.score + (i === question.answer ? 1 : 0) })} className={`flex min-h-13 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left ${right ? "border-gold bg-gold font-semibold text-on-gold" : wrong ? "border-accent bg-active" : "border-line-strong bg-surface"}`}>
                {option}{right && <Check aria-label="সঠিক" className="size-5" />}{wrong && <X aria-label="ভুল" className="size-5" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p role="status" className="min-h-7 text-center font-semibold">{answered && (game.picked === question.answer ? "সঠিক হয়েছে।" : `সঠিক উত্তর: ${question.options[question.answer]}`)}</p>
      {answered && <button type="button" className={solid} onClick={next}>{game.at + 1 === game.questions.length ? "ফল দেখুন" : "পরের প্রশ্ন"}</button>}
    </div>
  );
}

export function Quiz({ surahs }: { surahs: QuizSurah[] }) {
  return useInBrowser() ? <Inner surahs={surahs} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}
