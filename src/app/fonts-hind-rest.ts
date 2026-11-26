// The other two weights of Hind Siliguri, not preloaded: only Amiri and Hind 400/600 are.
// next/font takes the family name from the constant's name, so this `hind` and the one in fonts.ts
// are one family with four weights. Renaming either one breaks that; check a build after changes.
import localFont from "next/font/local";

const hind = localFont({
  variable: "--f-hind-rest",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0,U+1CD2,U+1CD5-1CD6,U+1CD8,U+1CE1,U+1CEA,U+1CED,U+1CF2,U+1CF5-1CF7,U+200C-200D,U+20B9,U+25CC,U+A8F1" }],
  src: [
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-bengali-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-bengali-700-normal.woff2", weight: "700" },
  ],
});

export const hindRestVariable = hind.variable;
