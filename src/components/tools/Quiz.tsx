"use client";

import { useState } from "react";
import { HeroCard } from "@/components/ui/HeroCard";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { badges, LEVELS, makeQuiz, parseScores, QUESTIONS, record, seeded, type Level, type Question, type QuizSurah } from "@/lib/tools/quiz";
import { dayKey } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const KEY = "noor.quiz.v1";
const card = "rounded-md border border-ln bg-sf shadow-card";
const solid = "min-h-13 w-full rounded-full bg-ac px-4 font-semibold text-on-ac";

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
        <HeroCard label="আজকের কুইজ">
          <p className="font-display text-xl font-bold">আজকের কুইজ</p>
          <p className="mb-4 text-sm text-hero-muted">টানা {toBnDigits(run)} দিন{scores.daily[today] !== undefined && ` · আজকের ফল ${toBnDigits(scores.daily[today])}/${toBnDigits(QUESTIONS)}`}</p>
          <button type="button" className="min-h-12 w-full rounded-full bg-gold px-4 font-semibold text-on-gold" onClick={() => begin({ day: today })}>{scores.daily[today] === undefined ? "শুরু করুন" : "আবার চর্চা করুন"}</button>
        </HeroCard>
        <section aria-labelledby="levels" className="space-y-3">
          <h2 id="levels" className="font-display text-lg font-semibold">লেভেল</h2>
          {LEVELS.map((l) => (
            <button key={l.id} type="button" onClick={() => begin({ level: l.id })} className={`${card} flex min-h-20 w-full items-center gap-3.5 p-4 text-left`}>
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-tint text-on-tint"><Icon name="trophy" /></span>
              <span className="min-w-0 flex-1 leading-snug"><span className="block font-display font-semibold">{l.name}</span><span className="block text-[0.8125rem] text-ink2">{l.hint}</span></span>
              <span className="shrink-0 text-[0.8125rem] text-gt">{scores.best[l.id] === undefined ? "খেলা হয়নি" : `সেরা ${toBnDigits(scores.best[l.id]!)}/${toBnDigits(QUESTIONS)}`}</span>
            </button>
          ))}
        </section>
        <section aria-labelledby="badges">
          <h2 id="badges" className="mb-2 font-display text-lg font-semibold">ব্যাজ</h2>
          <Badges list={badges(scores, run)} />
        </section>
        <p className="text-sm text-ink2">সব প্রশ্ন সূরার তালিকার তথ্য (Tanzil) থেকে অ্যাপ নিজে তৈরি করে।</p>
      </div>
    );
  }

  if (game.at >= game.questions.length) {
    return (
      <div className="space-y-4">
        <HeroCard label="ফলাফল" className="text-center">
          <p className="font-display text-lg">আপনার ফল</p>
          <p role="status" className="text-6xl font-bold tabular-nums text-hero-accent">{toBnDigits(game.score)}/{toBnDigits(game.questions.length)}</p>
        </HeroCard>
        <Badges list={badges(scores, run)} />
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="shrink-0 text-sm text-ink2">প্রশ্ন {toBnDigits(game.at + 1)} / {toBnDigits(game.questions.length)}</p>
        <ProgressBar value={(game.at + 1) / game.questions.length} className="flex-1" />
        <button type="button" aria-label="কুইজ বন্ধ করুন" className="-mr-2 grid size-11 shrink-0 place-items-center rounded-xl" onClick={() => setGame(null)}><Icon name="close" /></button>
      </div>
      <h2 className={`${card} p-5 font-display text-lg font-semibold`}>{question.text}</h2>
      <ul className="space-y-3">
        {question.options.map((option, i) => {
          const right = answered && i === question.answer;
          const wrong = answered && i === game.picked && !right;
          return (
            <li key={option}>
              <button type="button" disabled={answered} onClick={() => setGame({ ...game, picked: i, score: game.score + (i === question.answer ? 1 : 0) })} className={`flex min-h-15 w-full items-center gap-3 rounded-md border px-4 text-left font-medium ${right ? "border-ac bg-tint text-on-tint" : wrong ? "border-gt bg-gs" : "border-ln2 bg-sf"}`}>
                <span className="grid size-5 shrink-0 place-items-center">{right && <Icon name="check" className="size-5" />}{wrong && <Icon name="close" className="size-5" />}</span>
                <span>{option}{right && <span className="sr-only"> (সঠিক)</span>}{wrong && <span className="sr-only"> (ভুল)</span>}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p role="status" className={answered ? "rounded-md bg-gs p-4 font-semibold" : ""}>{answered && (game.picked === question.answer ? "সঠিক হয়েছে।" : `সঠিক উত্তর: ${question.options[question.answer]}`)}</p>
      {answered && <button type="button" className={solid} onClick={next}>{game.at + 1 === game.questions.length ? "ফল দেখুন" : "পরের প্রশ্ন"}</button>}
    </div>
  );
}

/** Earned badges are drawn in gold; the line fades in once, with no confetti. */
function Badges({ list }: { list: ReturnType<typeof badges> }) {
  return (
    <ul className="grid grid-cols-3 gap-x-2 gap-y-4 text-center xs:grid-cols-4">
      {list.map((b) => (
        <li key={b.name} className="flex flex-col items-center gap-1.5">
          <span aria-hidden="true" className={`grid size-14 place-items-center rounded-full border-[1.5px] ${b.earned ? "badge-in border-gd bg-gs text-gt" : "border-ln2 text-ink2"}`}><Icon name={b.earned ? "star" : "lock"} /></span>
          <span className="text-xs leading-snug">{b.name}<span className="sr-only">{b.earned ? " (পেয়েছেন)" : " (বাকি)"}</span></span>
        </li>
      ))}
    </ul>
  );
}

export function Quiz({ surahs }: { surahs: QuizSurah[] }) {
  return useInBrowser() ? <Inner surahs={surahs} /> : <Skeleton className="h-52 !rounded-3xl" />;
}
