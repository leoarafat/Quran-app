import { PendingNote } from "@/components/PendingNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { LinkList, type LinkItem } from "@/components/ui/LinkList";
import type { Topic } from "@/lib/topics";
import { TopicSources } from "./TopicSources";

export type TopicTool = LinkItem;

/** `lead` is what the visitor came for, shown right under the title. */
export function TopicPage({ topic, tools = [], lead, back = { href: "/more/", label: "আরও পাতায় ফিরে যান" }, children }: { topic: Topic; tools?: TopicTool[]; lead?: React.ReactNode; back?: { href: string; label: string }; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <ScreenHeader title={topic.title} back={back} />
      <div className="space-y-4">
        <p className="text-[0.9375rem] text-ink2">{topic.subtitle}</p>
        {lead}
        {topic.pending.length > 0 && <PendingNote title="যা এখনো নেই" items={[...topic.pending]} />}
        {tools.length > 0 && <LinkList items={tools} />}
        {children}
        <TopicSources topic={topic} />
      </div>
    </div>
  );
}
