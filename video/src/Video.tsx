import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, Crescent, ramp } from "./parts";
import { LESSONS } from "./Root";
import { SceneBody, STAGE } from "./scenes";
import { BODY, C } from "./theme";
import type { Clip, Scene } from "./types";

/** A long sentence is shown in two or three pieces, each for its share of the audio. */
function chunks(clip: Clip) {
  const words = clip.text.replace(/^অর্থ:\s*/, "অর্থ: ").split(" ");
  const parts = Math.ceil(clip.text.length / 92);
  if (parts <= 1) return [{ text: clip.text, from: clip.from, dur: clip.dur }];
  const target = clip.text.length / parts;
  const lines: string[] = [""];
  for (const word of words) {
    const line = lines[lines.length - 1];
    const atPause = /[,;—]$/.test(line) && line.length > target * 0.65;
    if (line && lines.length < parts && (atPause || line.length + word.length > target * 1.15)) lines.push(word);
    else lines[lines.length - 1] = line ? `${line} ${word}` : word;
  }
  const total = lines.join("").length;
  let at = clip.from;
  return lines.map((text) => {
    const dur = Math.round((clip.dur * text.length) / total);
    const piece = { text, from: at, dur };
    at += dur;
    return piece;
  });
}

const Subtitle = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const all = scene.clips.flatMap((clip) =>
    clip.lang === "ar" ? [{ text: "আরবি শুনুন, সাথে সাথে পড়ুন", from: clip.from, dur: clip.dur, ar: true }] : chunks(clip).map((p) => ({ ...p, ar: false })),
  );
  // The line stays up through the short gap after it, so the box does not flicker.
  const index = all.findIndex((c, i) => frame >= c.from - 3 && frame < Math.min(c.from + c.dur + 16, (all[i + 1]?.from ?? Infinity) - 3));
  const current = all[index];
  if (!current) return null;
  return (
    <div style={{ position: "absolute", left: 44, right: 44, bottom: 38, height: 192, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: ramp(frame, current.from - 3, 5), padding: "16px 34px", borderRadius: 26, background: "rgba(0,0,0,0.78)", border: `2px solid ${current.ar ? C.gold : "rgba(255,255,255,0.08)"}`, fontFamily: BODY, fontWeight: 600, fontSize: 40, lineHeight: 1.5, textAlign: "center", color: current.ar ? C.goldStrong : "#fffaf0", textWrap: "balance" }}>
        {current.ar ? "♪ " : ""}
        {current.text}
      </div>
    </div>
  );
};

const Header = ({ id }: { id: keyof typeof LESSONS }) => {
  const frame = useCurrentFrame();
  const lesson = LESSONS[id];
  const index = lesson.chapters.reduce((found, c, i) => (frame >= c.from ? i : found), -1);
  const first = lesson.scenes[0];
  const last = lesson.scenes[lesson.scenes.length - 1];
  const opacity = ramp(frame, first.dur - 8) * (1 - ramp(frame, last.from - 6, 10));
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 34, left: STAGE.side, right: STAGE.side, opacity }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.goldStrong, whiteSpace: "nowrap" }}>
          <Crescent size={46} />
          {lesson.name}
        </div>
        <div style={{ padding: "4px 24px", borderRadius: 999, background: C.surface, border: `2px solid ${C.lineStrong}`, fontFamily: BODY, fontWeight: 600, fontSize: 28, color: C.soft, whiteSpace: "nowrap" }}>{lesson.chapters[index]?.title}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {lesson.chapters.map((chapter, i) => {
          const end = lesson.chapters[i + 1]?.from ?? last.from;
          const done = interpolate(frame, [chapter.from, end], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={chapter.title} style={{ flex: end - chapter.from, height: 8, borderRadius: 8, background: C.line, overflow: "hidden" }}>
              <div style={{ width: `${done}%`, height: "100%", background: C.gold }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SceneView = ({ scene, marks }: { scene: Scene; marks: number }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: STAGE.top, height: STAGE.height, left: STAGE.side, right: STAGE.side, opacity: ramp(frame, 0, 10) * (1 - ramp(frame, scene.dur - 9, 9)) }}>
        <SceneBody scene={scene} marks={marks} />
      </div>
      <Subtitle scene={scene} />
    </AbsoluteFill>
  );
};

export const Video = ({ id }: { id: keyof typeof LESSONS }) => {
  const lesson = LESSONS[id];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      <Header id={id} />
      {lesson.scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.dur} name={scene.id}>
          <SceneView scene={scene} marks={lesson.marks} />
          {scene.clips.map((clip) => (
            <Sequence key={clip.file + clip.from} from={clip.from} durationInFrames={clip.dur}>
              <Audio src={staticFile(clip.file)} startFrom={clip.trim} />
            </Sequence>
          ))}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
