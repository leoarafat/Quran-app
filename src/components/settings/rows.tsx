import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const row = "relative flex min-h-14 w-full items-center gap-3 py-1.5 text-left";

function Text({ title, value }: { title: string; value?: string }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block">{title}</span>
      {value && <span className="block truncate text-[0.8125rem] leading-snug text-ink2">{value}</span>}
    </span>
  );
}

/** Opens the phone's own list of choices; the row shows the one in use. */
export function SelectRow<T extends string | number>({ title, value, options, text, onChange }: { title: string; value: T; options: readonly T[]; text: (v: T) => string; onChange: (v: T) => void }) {
  return (
    <label className={`${row} cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-ac`}>
      <span aria-hidden="true" className="contents"><Text title={title} value={text(value)} /></span>
      <Icon name="chev" className="size-5 text-ink2" />
      <select aria-label={title} value={value} onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)} className="absolute inset-0 size-full cursor-pointer opacity-0">
        {options.map((o) => <option key={o} value={o} className="text-black">{text(o)}</option>)}
      </select>
    </label>
  );
}

export function LinkRow({ title, value, href }: { title: string; value?: string; href: string }) {
  return (
    <Link href={href} className={row}>
      <Text title={title} value={value} />
      <Icon name="chev" className="size-5 text-ink2" />
    </Link>
  );
}

export function ButtonRow({ title, value, onClick }: { title: string; value?: string; onClick: () => void }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={onClick} className={row}>
      <Text title={title} value={value} />
      <Icon name="chev" className="size-5 text-ink2" />
    </button>
  );
}

export function StaticRow({ title, value }: { title: string; value: string }) {
  return <p className={row}><Text title={title} value={value} /></p>;
}

export const rowCard = "divide-y divide-ln rounded-md border border-ln bg-sf px-4 py-1 shadow-card";
