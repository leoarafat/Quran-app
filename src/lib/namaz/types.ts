import type { Passage } from "@/lib/topics";
import type { DuaKey } from "./dua-text";
import type { Pose } from "@/components/namaz/Figure";

export type Block =
  | { kind: "text"; text: string }
  /** a warning or a difference of opinion that the reader should not skip */
  | { kind: "note"; text: string }
  | { kind: "list"; title?: string; items: string[]; ordered?: boolean }
  /** one thing to do in the prayer: picture, actions, then what to say */
  | { kind: "step"; title: string; pose?: Pose; do: string[]; say?: DuaKey[]; tip?: string }
  | { kind: "duas"; keys: DuaKey[] }
  /** labelled rows, e.g. one prayer time and its rakats */
  | { kind: "card"; title: string; rows: [label: string, value: string][]; foot?: string }
  | { kind: "ayat"; passages: Passage[] }
  | { kind: "link"; href: string; label: string };

export type Section = { id: string; title: string; blocks: Block[] };

export type Lesson = { slug: string; title: string; hint: string; intro: string; sections: Section[] };
