import { AbsoluteFill } from "remotion";
import { Figure } from "./Figure";
import { Backdrop, Crescent } from "./parts";
import { LESSONS } from "./Root";
import { BODY, C, DISPLAY } from "./theme";

export const Poster = ({ id }: { id: keyof typeof LESSONS }) => (
  <AbsoluteFill>
    <Backdrop />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, textAlign: "center", padding: 60 }}>
      <Crescent size={130} />
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 94, lineHeight: 1.3, color: C.text }}>{LESSONS[id].name}</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 48, color: C.goldStrong }}>নিয়ম ও দোয়া, ধাপে ধাপে</div>
      <div style={{ display: "flex", justifyContent: "center", width: 600, padding: "20px 0", borderRadius: "300px 300px 36px 36px", background: C.surface, border: `3px solid ${C.gold}` }}>
        <Figure pose={id === "eid" ? "takbir" : "fold"} size={380} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
