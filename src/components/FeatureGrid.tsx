import Link from "next/link";
import { FEATURE_GROUPS, type Feature } from "@/lib/features";

function Tile({ title, hint, icon: Icon, href }: Feature) {
  const body = (
    <>
      <span className="grid size-11 place-items-center rounded-t-[1.5rem] rounded-b-xl border border-line-strong text-accent">
        <Icon aria-hidden className="size-6" />
      </span>
      <span className="font-display font-semibold leading-snug">{title}</span>
      <span className="text-sm leading-snug text-muted">{hint}</span>
      {!href && <span className="mt-auto rounded-full bg-accent-soft px-2 text-xs text-accent">শীঘ্রই</span>}
    </>
  );
  const base = "flex h-full flex-col items-center gap-1.5 rounded-[1.375rem] border border-line bg-surface p-3 text-center";
  return href ? (
    <Link href={href} className={`${base} transition-colors hover:border-brand`}>{body}</Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

export function FeatureGrid() {
  return (
    <div className="space-y-6">
      {FEATURE_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 font-display text-lg font-semibold">{group.title}</h2>
          <ul className="grid grid-cols-2 gap-3 min-[22.5rem]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {group.items.map((f) => (
              <li key={f.title}><Tile {...f} /></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
