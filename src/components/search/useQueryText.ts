"use client";

import { useEffect, useState } from "react";

/** What is typed, and the same words once the typing has paused. */
export function useQueryText(initial: string) {
  const [text, setText] = useState(initial);
  const [query, setQuery] = useState(initial.trim());
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);
  const choose = (value: string) => { setText(value); setQuery(value.trim()); };
  return { text, query, type: setText, choose, submit: () => setQuery(text.trim()) };
}
