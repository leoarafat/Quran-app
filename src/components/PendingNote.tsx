import { Icon } from "@/components/ui/Icon";

/** Says plainly what a page does not have yet, and what it is waiting for. */
export function PendingNote({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex gap-3 rounded-md bg-gs p-4">
      <Icon name="info" className="mt-0.5 size-5 shrink-0 text-gt" />
      <div className="min-w-0 text-sm leading-relaxed">
        <h2 className="font-semibold text-gt">{title}</h2>
        <ul className="mt-1 list-disc space-y-1 pl-4">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}
