import { Hourglass } from "lucide-react";

/** Says plainly what a page does not have yet, and what it is waiting for. */
export function PendingNote({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex gap-3 rounded-[1.375rem] border border-dashed border-line-strong p-4">
      <Hourglass aria-hidden className="mt-1 size-5 shrink-0 text-accent" />
      <div className="min-w-0 text-sm leading-relaxed text-muted">
        <h2 className="font-semibold text-text">{title}</h2>
        <ul className="mt-1 list-disc space-y-1 pl-4">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}
