import Link from "next/link";

const style = (on: boolean) => `inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium ${on ? "border-ac bg-ac text-on-ac" : "border-ln2 bg-sf text-ink"}`;

type Common = { selected?: boolean; className?: string; children: React.ReactNode };

/** A pill: a link with `href`, otherwise a button. */
export function Chip({ selected = false, className = "", children, ...props }: Common & ({ href: string } | React.ButtonHTMLAttributes<HTMLButtonElement>)) {
  if ("href" in props && props.href !== undefined) return <Link href={props.href} className={`${style(selected)} ${className}`}>{children}</Link>;
  return <button type="button" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} className={`${style(selected)} ${className}`}>{children}</button>;
}
