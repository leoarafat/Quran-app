"use client";

import { useEffect, useState } from "react";
import type { HadithFilters, HadithFound } from "@/lib/hadith/search";
import type { Filters, Found } from "./engine";
import type { SearchReply, SearchRequest } from "./search.worker";

let worker: Worker | null = null;
let lastId = 0;
const waiting = new Map<number, (reply: SearchReply) => void>();

type Ask = SearchRequest extends infer R ? (R extends SearchRequest ? Omit<R, "id"> : never) : never;

function ask(request: Ask, done: (reply: SearchReply) => void): () => void {
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
    worker.postMessage({ ...request, id } as SearchRequest);
  } catch {
    waiting.set(id, done);
    queueMicrotask(fail);
  }
  return () => { waiting.delete(id); };
}

export type SearchState<T> = { status: "idle" | "searching" | "done" | "error"; found: T | null; retry: () => void };

function useWorkerSearch<T>(request: Ask): SearchState<T> {
  const [attempt, setAttempt] = useState(0);
  const [answer, setAnswer] = useState<{ key: string; base: string; found: T | null } | null>(null);
  // "base" ignores the page size, so asking for more keeps the current results on screen.
  const base = JSON.stringify([request.scope, request.query, request.filters]);
  const key = `${base}|${request.limit}|${attempt}`;
  const active = request.query.trim().length > 0;

  useEffect(() => {
    if (!active) return;
    return ask(request, (reply) => setAnswer({ key, base, found: reply.failed ? null : (reply.found as T) }));
    // "key" covers every part of the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  const retry = () => setAttempt((n) => n + 1);
  if (!active) return { status: "idle", found: null, retry };
  if (answer?.key === key) return { status: answer.found ? "done" : "error", found: answer.found, retry };
  return { status: "searching", found: answer?.base === base ? answer.found : null, retry };
}

export const useSearch = (query: string, filters: Filters, limit: number) => useWorkerSearch<Found>({ scope: "quran", query, filters, limit });
export const useHadithSearch = (query: string, filters: HadithFilters, limit: number) => useWorkerSearch<HadithFound>({ scope: "hadith", query, filters, limit });
