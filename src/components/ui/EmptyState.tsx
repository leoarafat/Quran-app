import { Icon, type IconName } from "./Icon";

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <Icon name={icon} className="size-14 text-gd" />
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <p className="text-sm text-ink2">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
