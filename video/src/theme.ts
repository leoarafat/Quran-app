import { continueRender, delayRender, staticFile } from "remotion";

export const W = 1080;
export const H = 1350;

/** The app's own night theme, নূর-এ-লাইল. */
export const C = {
  bg: "#06130e",
  surface: "#0e211a",
  raised: "#14301f",
  text: "#f4eedf",
  soft: "#c8d6cd",
  muted: "#a9bdb2",
  line: "#284238",
  lineStrong: "#3a5647",
  gold: "#d9b46a",
  goldStrong: "#ebcb88",
  onGold: "#14100a",
};

export const BODY = "NoorBody, sans-serif";
export const DISPLAY = "NoorDisplay, NoorBody, serif";
export const ARABIC = "NoorArabic, serif";

const BENGALI_RANGE = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0,U+1CD2,U+1CD5-1CD6,U+1CD8,U+1CE1,U+1CEA,U+1CED,U+1CF2,U+1CF5-1CF7,U+200C-200D,U+20B9,U+25CC,U+A8F1";

if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  const faces = [
    ...[400, 500, 600, 700].flatMap((weight) =>
      ["bengali", "latin"].map(
        (set) =>
          new FontFace("NoorBody", `url(${staticFile(`fonts/hind-siliguri-${set}-${weight}-normal.woff2`)})`, {
            weight: String(weight),
            ...(set === "bengali" ? { unicodeRange: BENGALI_RANGE } : { unicodeRange: "U+0000-00FF,U+2000-206F" }),
          }),
      ),
    ),
    ...[600, 700].map((weight) => new FontFace("NoorDisplay", `url(${staticFile(`fonts/noto-serif-bengali-bengali-${weight}-normal.woff2`)})`, { weight: String(weight) })),
    new FontFace("NoorArabic", `url(${staticFile("fonts/amiri-quran-arabic-400-normal.woff2")})`),
  ];
  Promise.all(faces.map((face) => face.load().then((loaded) => document.fonts.add(loaded)))).then(() => continueRender(handle));
}
