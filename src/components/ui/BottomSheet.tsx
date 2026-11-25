"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

/**
 * A native modal dialog, so focus is held inside, Escape closes it and focus returns to the opener.
 * Slides from the bottom on phones; a centred card from tablet width. Render it only while open.
 */
export function BottomSheet({ title, onClose, children, full = false }: { title: string; onClose: () => void; children: React.ReactNode; /** use the whole height, as the audio player does */ full?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) {
      node.showModal();
      // React's autoFocus runs before the dialog is open, so the wanted field is marked instead.
      node.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={heading}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      className={`sheet m-auto mb-0 w-full max-w-lg overflow-y-auto overscroll-contain border border-ln bg-sf p-0 text-ink backdrop:bg-black/45 md:mb-auto md:rounded-3xl ${full ? "h-[calc(100dvh-var(--safe-top))] max-h-[calc(100dvh-var(--safe-top))] rounded-t-3xl md:h-auto md:max-h-[92dvh]" : "max-h-[88dvh] rounded-t-[1.75rem]"}`}
    >
      <div className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 -mx-4 bg-sf px-4 pt-2.5">
          <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-ln2 md:hidden" />
          <div className="flex min-h-14 items-center justify-between gap-3">
            <h2 id={heading} className="min-w-0 truncate font-display text-xl font-semibold">{title}</h2>
            <button type="button" aria-label="বন্ধ করুন" onClick={() => dialog.current?.close()} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-xl">
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
