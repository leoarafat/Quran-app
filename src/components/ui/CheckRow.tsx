import { Icon } from "./Icon";

/** One line of a checklist: the whole line is the checkbox. */
export function CheckRow({ done, title, hint, onToggle, trailing, strike = false }: { done: boolean; title: string; hint?: string; onToggle: () => void; trailing?: React.ReactNode; /** cross the words out once ticked */ strike?: boolean }) {
  return (
    <li className="flex items-center gap-1 border-b border-ln last:border-0">
      <button type="button" role="checkbox" aria-checked={done} onClick={onToggle} className="flex min-h-15 min-w-0 flex-1 items-center gap-3.5 py-2 text-left">
        <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full ${done ? "bg-ac text-on-ac" : "border-[1.5px] border-ink2"}`}>{done && <Icon name="check" className="size-4" />}</span>
        <span className="min-w-0 leading-snug">
          <span className={`block break-words font-semibold ${strike && done ? "text-ink2 line-through" : ""}`}>{title}</span>
          {hint && <span className="block text-[0.8125rem] text-ink2">{hint}</span>}
        </span>
      </button>
      {trailing}
    </li>
  );
}
