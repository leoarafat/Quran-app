// Fonts through next/font, from the files already installed by @fontsource (no download while
// building). next/font cannot pick subsets of local files, so each subset is its own family with
// its own unicode-range, and globals.css lists them one after another.
// next/font reads these calls without running them, so every value has to be written out.
import localFont from "next/font/local";
import { hindRestVariable } from "./fonts-hind-rest";


const amiri = localFont({
  variable: "--f-amiri",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC" }],
  src: [{ path: "../../node_modules/@fontsource/amiri-quran/files/amiri-quran-arabic-400-normal.woff2", weight: "400" }],
});

const amiriLatin = localFont({
  variable: "--f-amiri-latin",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" }],
  src: [{ path: "../../node_modules/@fontsource/amiri-quran/files/amiri-quran-latin-400-normal.woff2", weight: "400" }],
});

const hind = localFont({
  variable: "--f-hind",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0,U+1CD2,U+1CD5-1CD6,U+1CD8,U+1CE1,U+1CEA,U+1CED,U+1CF2,U+1CF5-1CF7,U+200C-200D,U+20B9,U+25CC,U+A8F1" }],
  src: [
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-bengali-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-bengali-600-normal.woff2", weight: "600" },
  ],
});

const hindLatin = localFont({
  variable: "--f-hind-latin",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" }],
  src: [
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/hind-siliguri/files/hind-siliguri-latin-700-normal.woff2", weight: "700" },
  ],
});

const notoSerif = localFont({
  variable: "--f-serif",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0,U+1CD2,U+1CD5-1CD6,U+1CD8,U+1CE1,U+1CEA,U+1CED,U+1CF2,U+1CF5-1CF7,U+200C-200D,U+20B9,U+25CC,U+A8F1" }],
  src: [
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-bengali-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-bengali-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-bengali-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-bengali-700-normal.woff2", weight: "700" },
  ],
});

const notoSerifLatin = localFont({
  variable: "--f-serif-latin",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" }],
  src: [
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-latin-700-normal.woff2", weight: "700" },
  ],
});

export const fontVariables = [amiri, amiriLatin, hind, hindLatin, notoSerif, notoSerifLatin].map((f) => f.variable).concat(hindRestVariable).join(" ");
