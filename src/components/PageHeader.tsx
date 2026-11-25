export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5 lg:mb-6 lg:border-b lg:border-line lg:pb-4">
      <h1 className="font-display text-[1.625rem] font-semibold leading-snug lg:text-[2.125rem]">{title}</h1>
      {subtitle && <p className="text-sm text-muted lg:text-base">{subtitle}</p>}
    </header>
  );
}
