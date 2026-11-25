/** Marks whole words only, so Arabic joining and Bangla conjuncts are never broken. */
export function Highlight({ text, words }: { text: string; words: number[] }) {
  if (!words.length) return text;
  const marked = new Set(words);
  return text.split(" ").map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      {marked.has(i) ? <mark className="rounded bg-gd/30 px-0.5 text-inherit">{word}</mark> : word}
    </span>
  ));
}
