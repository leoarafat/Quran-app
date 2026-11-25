"use client";

import { useEffect, useState } from "react";
import type { Filters, Found } from "./engine";
import type { SearchReply, SearchRequest } from "./search.worker";

let worker: Worker | null = null;
let lastId = 0;
const waiting = new Map<number, (reply: SearchReply) => void>();

function ask(request: Omit<SearchRequest, "id">, done: (reply: SearchReply) => void): () => void {
  const id = ++lastId;
  const fail = () => {
    worker?.terminate();
    worker = null;
    for (const [key, callback] of waiting) callback({ id: key, failed: true });
    waiting.clear();
  };
  try {
    if (!worker) {
      worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<SearchReply>) => {
        waiting.get(event.data.id)?.(event.data);
        waiting.delete(event.data.id);
      };
      worker.onerror = fail;
    }
    waiting.set(id, done);
    worker.postMessage({ ...request, id } satisfies SearchRequest);
  } catch {
    waiting.set(id, done);
    queueMicrotask(fail);
  }
  return () => { waiting.delete(id); };
}

export type SearchState = { status: "idle" | "searching" | "done" | "error"; found: Found | null; retry: () => void };

export function useSearch(query: string, filters: Filters, limit: number): SearchState {
  const [attempt, setAttempt] = useState(0);
  const [answer, setAnswer] = useState<{ key: string; base: string; found: Found | null } | null>(null);
  // "base" ignores the page size, so asking for more keeps the current results on screen.
  const base = JSON.stringify([query, filters]);
  const key = `${base}|${limit}|${attempt}`;
  const active = query.trim().length > 0;

  useEffect(() => {
    if (!active) return;
    return ask({ query, filters, limit }, (reply) => setAnswer({ key, base, found: reply.failed ? null : reply.found! }));
    // "key" covers query, filters and limit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  const retry = () => setAttempt((n) => n + 1);
  if (!active) return { status: "idle", found: null, retry };
  if (answer?.key === key) return { status: answer.found ? "done" : "error", found: answer.found, retry };
  return { status: "searching", found: answer?.base === base ? answer.found : null, retry };
}
