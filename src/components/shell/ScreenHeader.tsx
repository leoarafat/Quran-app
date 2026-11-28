import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const headerButton = "grid size-11 shrink-0 place-items-center rounded-xl";

/**
 * A page's own title bar on phones. From tablet width the shell's top bar shows the title,
 * so here the heading stays only for screen readers.
 */
export function ScreenHeader({ title, back, children }: { title: string; /** where the back arrow leads */ back?: { href: string; label: string }; /** buttons on the right */ children?: React.ReactNode }) {
  return (
    <header className="app-bar mb-4 flex min-h-14 items-center gap-1 md:sr-only">
      {back && <Link href={back.href} aria-label={back.label} className={`${headerButton} -ml-2.5`}><Icon name="back" /></Link>}
      <h1 className="min-w-0 flex-1 truncate font-display text-[1.1875rem] font-semibold">{title}</h1>
      <div className="-mr-2.5 flex md:hidden">{children}</div>
    </header>
  );
}

export function SettingsLink() {
  return <Link href="/settings/" aria-label="সেটিংস" className={headerButton}><Icon name="settings" /></Link>;
}
