import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { QuranPassages } from "@/components/quran/QuranPassages";
import { toBnDigits } from "@/lib/bn";
import { dua, type DuaKey } from "@/lib/namaz/dua-text";
import type { Block } from "@/lib/namaz/types";
import { getPassages } from "@/lib/quran/passages";
import { Figure, POSE_NAMES } from "./Figure";

function DuaCard({ id }: { id: DuaKey }) {
  const d = dua(id);
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-bg px-3 py-3">
      <h4 className="text-sm font-semibold text-accent">{d.title}</h4>
      <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-[2.4]">{d.ar}</p>
      <p className="reading leading-relaxed"><span className="text-sm text-muted">উচ্চারণ: </span>{d.pron}</p>
      <p className="reading leading-relaxed text-muted"><span className="text-sm">অর্থ: </span>{d.meaning}</p>
      <Link href={`/hadith/${d.hadith}/`} prefetch={false} className="inline-flex min-h-11 items-center text-sm text-muted underline">আরবির উৎস: হাদিস {toBnDigits(d.hadith)}</Link>
    </div>
  );
}

const List = ({ items, ordered }: { items: string[]; ordered?: boolean }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-1.5 pl-5 leading-relaxed marker:text-accent ${ordered ? "list-[bengali]" : "list-disc"}`}>
      {items.map((item) => <li key={item} className="reading pl-1">{item}</li>)}
    </Tag>
  );
};

/** One block of a lesson. `anchor` keeps ayah ids unique when a passage appears twice on a page. */
export function LessonBlock({ block, anchor }: { block: Block; anchor: string }) {
  switch (block.kind) {
    case "text":
      return <p className="reading leading-relaxed">{block.text}</p>;
    case "note":
      return <p className="reading rounded-2xl border border-dashed border-line-strong px-3 py-2 leading-relaxed text-muted">{block.text}</p>;
    case "list":
      return (
        <div className="rounded-[1.375rem] border border-line bg-surface p-4">
          {block.title && <h3 className="mb-2 font-display font-semibold">{block.title}</h3>}
          <List items={block.items} ordered={block.ordered} />
        </div>
      );
    case "step":
      return (
        <article className="space-y-3 rounded-[1.375rem] border border-line-strong bg-surface p-4">
          <h3 className="font-display text-lg font-semibold leading-snug">{block.title}</h3>
          <div className={block.pose ? "space-y-3 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0" : ""}>
          {block.pose && (
            <figure className="mx-auto w-44 max-w-full text-center">
              <Figure pose={block.pose} />
              <figcaption className="text-sm text-muted">{POSE_NAMES[block.pose]}</figcaption>
            </figure>
          )}
          <div className="space-y-3">
          <List items={block.do} />
          {block.say?.map((key) => <DuaCard key={key} id={key} />)}
          {block.tip && <p className="reading rounded-2xl border border-dashed border-line-strong px-3 py-2 text-sm leading-relaxed text-muted">{block.tip}</p>}
          </div>
          </div>
        </article>
      );
    case "duas":
      return <div className="space-y-2">{block.keys.map((key) => <DuaCard key={key} id={key} />)}</div>;
    case "card":
      return (
        <article className="rounded-[1.375rem] border border-line bg-surface p-4">
          <h3 className="font-display font-semibold leading-snug">{block.title}</h3>
          <dl className="mt-2 divide-y divide-line">
            {block.rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 py-2">
                <dt className="text-sm font-semibold text-accent">{label}</dt>
                <dd className="reading leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>
          {block.foot && <p className="mt-1 text-sm leading-relaxed text-muted">{block.foot}</p>}
        </article>
      );
    case "ayat": {
      const { passages, credit } = getPassages(block.passages);
      return (
        <div data-anchor={anchor} className="space-y-2">
          <QuranPassages passages={passages} credit={credit} idPrefix={anchor} />
          <p className="text-center text-sm text-muted">{credit}</p>
        </div>
      );
    }
    case "link":
      return (
        <Link href={block.href} className="flex min-h-14 items-center justify-between gap-3 rounded-[1.375rem] border border-line-strong bg-surface px-4 py-2 font-semibold text-accent hover:border-brand">
          {block.label}
          <ChevronRight aria-hidden className="size-5 shrink-0" />
        </Link>
      );
  }
}
