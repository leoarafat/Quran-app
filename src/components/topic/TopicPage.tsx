import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PendingNote } from "@/components/PendingNote";
import type { Topic } from "@/lib/topics";
import { TopicSources } from "./TopicSources";

export type TopicTool = { href: string; title: string; hint: string; icon: LucideIcon };

export function TopicPage({ topic, tools = [], children }: { topic: Topic; tools?: TopicTool[]; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title={topic.title} subtitle={topic.subtitle} />
      <PendingNote title="যা এখনো নেই" items={[...topic.pending]} />
      {tools.length > 0 && (
        <ul className="space-y-2">
          {tools.map(({ href, title, hint, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-3 rounded-[1.375rem] border border-line-strong bg-surface px-4 py-2 hover:border-brand">
                <Icon aria-hidden className="size-6 shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold leading-snug">{title}</span>
                  <span className="block text-sm text-muted">{hint}</span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {children}
      <TopicSources topic={topic} />
    </div>
  );
}
