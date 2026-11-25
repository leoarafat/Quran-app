import { interpolate, useCurrentFrame } from "remotion";
import { Figure, POSE_NAMES } from "./Figure";
import { Crescent, digits, ramp, rise } from "./parts";
import { ARABIC, BODY, C, DISPLAY } from "./theme";
import type { Pose, Scene } from "./types";

/** Everything a scene draws stays inside this box; the header sits above it and the subtitle below. */
export const STAGE = { top: 168, height: 912, side: 60 };

const Heading = ({ children, size = 58 }: { children: React.ReactNode; size?: number }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...rise(frame, 2), fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.35, color: C.text, textAlign: "center" }}>{children}</div>
  );
};

/** The frame at which the n-th of `count` items should appear, spread over the narration. */
const revealAt = (scene: Scene, index: number, count: number) => {
  const first = scene.clips[0].from;
  const last = scene.clips[scene.clips.length - 1];
  return Math.round(first + (index * (last.from + last.dur - first)) / (count + 0.6));
};

const Points = ({ scene, size = 40, gap = 18 }: { scene: Scene; size?: number; gap?: number }) => {
  const frame = useCurrentFrame();
  const points = scene.points ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {points.map((point, i) => (
        <div key={point} style={{ ...rise(frame, revealAt(scene, i, points.length)), display: "flex", alignItems: "center", gap: 22, padding: "14px 28px", background: C.surface, border: `2px solid ${C.lineStrong}`, borderRadius: 24 }}>
          <div style={{ width: 16, height: 16, flexShrink: 0, background: C.gold, transform: "rotate(45deg)" }} />
          <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: size, lineHeight: 1.4, color: C.text }}>{point}</div>
        </div>
      ))}
    </div>
  );
};

/** A pose that changes into `then` part of the way through, as the narrator reaches it. */
const MovingFigure = ({ pose, then, switchAt, size }: { pose: Pose; then?: Pose; switchAt: number; size: number }) => {
  const frame = useCurrentFrame();
  const t = then ? ramp(frame, switchAt, 12) : 0;
  const name = then && t > 0.5 ? then : pose;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size * 1.3 }}>
        <div style={{ position: "absolute", opacity: 1 - t }}>
          <Figure pose={pose} size={size} />
        </div>
        {then && (
          <div style={{ position: "absolute", opacity: t }}>
            <Figure pose={then} size={size} />
          </div>
        )}
      </div>
      <div style={{ marginTop: 6, padding: "4px 30px", borderRadius: 999, background: C.gold, color: C.onGold, fontFamily: BODY, fontWeight: 700, fontSize: 32 }}>{POSE_NAMES[name]}</div>
    </div>
  );
};

const switchFrame = (scene: Scene) => {
  const last = scene.clips[scene.clips.length - 1];
  if (scene.clips.length > 1) return scene.id === "j41" ? scene.clips[1].from + Math.round(scene.clips[1].dur * 0.3) : last.from;
  return Math.round(last.from + last.dur * 0.68);
};

const Counter = ({ scene, marks }: { scene: Scene; marks: number }) => {
  const frame = useCurrentFrame();
  if (!scene.count) return null;
  // When one scene covers several takbirs, they light up one after another with the narration.
  const lit = scene.countFrom
    ? Math.min(scene.count, scene.countFrom + Math.floor(interpolate(frame, [scene.clips[0].from, scene.dur - 20], [0, scene.count], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })))
    : scene.count;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18, marginTop: 8 }}>
      <span style={{ fontFamily: BODY, fontSize: 32, color: C.muted }}>তাকবির</span>
      {Array.from({ length: marks }, (_, i) => (
        <div key={i} style={{ width: 62, height: 62, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 700, fontSize: 34, background: i < lit ? C.gold : "transparent", color: i < lit ? C.onGold : C.muted, border: `3px solid ${i < lit ? C.goldStrong : C.lineStrong}`, transform: i === lit - 1 ? `scale(${1 + 0.08 * Math.sin(Math.min(Math.PI, frame / 8))})` : undefined }}>
          {digits(i + 1)}
        </div>
      ))}
    </div>
  );
};

const Title = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 26 }}>
      <div style={rise(frame, 4)}><Crescent size={190} /></div>
      <div style={{ ...rise(frame, 12), fontFamily: DISPLAY, fontWeight: 700, fontSize: scene.heading.length > 24 ? 70 : 96, lineHeight: 1.35, color: C.text }}>{scene.heading}</div>
      <div style={{ ...rise(frame, 22), width: 260, height: 4, background: C.gold }} />
      <div style={{ ...rise(frame, 28), fontFamily: BODY, fontWeight: 600, fontSize: 50, color: C.goldStrong, lineHeight: 1.45 }}>{scene.sub}</div>
      <div style={{ ...rise(frame, 38), marginTop: 20, padding: "14px 38px", borderRadius: 999, border: `2px solid ${C.lineStrong}`, background: C.surface, fontFamily: BODY, fontSize: 34, color: C.soft }}>{scene.note}</div>
    </div>
  );
};

const ICONS = {
  info: "M 50 12 a 38 38 0 1 0 0.1 0 M 50 44 V 72 M 50 29 v 2",
  sun: "M 50 32 a 18 18 0 1 0 0.1 0 M 50 8 V 20 M 50 80 V 92 M 8 50 H 20 M 80 50 H 92 M 20 20 L 29 29 M 71 71 L 80 80 M 80 20 L 71 29 M 29 71 L 20 80",
  sparkle: "M 50 10 L 59 41 L 90 50 L 59 59 L 50 90 L 41 59 L 10 50 L 41 41 Z",
};

const Info = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
      <div style={{ ...rise(frame, 0), display: "flex", justifyContent: "center" }}>
        {scene.pose ? (
          <Figure pose={scene.pose} size={300} />
        ) : (
          <div style={{ width: 168, height: 168, borderRadius: 999, background: C.raised, border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={100} height={100} viewBox="0 0 100 100" fill="none" stroke={C.goldStrong} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[scene.icon ?? "info"]} /></svg>
          </div>
        )}
      </div>
      <Heading>{scene.heading}</Heading>
      <Points scene={scene} size={scene.pose ? 38 : 42} gap={scene.pose ? 14 : 20} />
    </div>
  );
};

const Step = ({ scene, marks }: { scene: Scene; marks: number }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <Heading size={54}>{scene.heading}</Heading>
        <Counter scene={scene} marks={marks} />
      </div>
      <div style={{ ...rise(frame, 6), alignSelf: "center", width: 620, display: "flex", justifyContent: "center", padding: "10px 0 16px", borderRadius: "310px 310px 36px 36px", background: `linear-gradient(180deg, ${C.raised}, ${C.surface})`, border: `3px solid ${C.lineStrong}` }}>
        <MovingFigure pose={scene.pose ?? "stand"} then={scene.then} switchAt={switchFrame(scene)} size={(scene.points?.length ?? 0) > 2 ? 305 : 345} />
      </div>
      <Points scene={scene} size={36} gap={12} />
    </div>
  );
};

const Card = ({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) => (
  <div style={{ position: "relative", padding: "30px 34px 20px", borderRadius: 28, background: active ? C.raised : C.surface, border: `3px solid ${active ? C.gold : C.line}`, boxShadow: active ? "0 0 44px rgba(217,180,106,0.28)" : "none" }}>
    <div style={{ position: "absolute", top: -19, left: 30, padding: "0 20px", borderRadius: 999, background: active ? C.gold : C.lineStrong, color: active ? C.onGold : C.text, fontFamily: BODY, fontWeight: 700, fontSize: 26, lineHeight: "38px" }}>{label}</div>
    {children}
  </div>
);

const Dua = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const arabic = scene.clips.findIndex((c) => c.lang === "ar");
  const within = (i: number) => {
    const c = scene.clips[i];
    return !!c && frame >= c.from - 6 && frame < c.from + c.dur + 8;
  };
  const reciting = within(arabic);
  const meaningFrom = scene.clips.findIndex((c) => c.text.startsWith("অর্থ:"));
  const meaningClips = scene.clips.filter((c, i) => meaningFrom >= 0 && i >= meaningFrom);
  const spokenMeaning = (scene.meaning ?? "").split(/(?<=[।?!])\s+/).length;
  const lastMeaning = meaningClips[Math.min(spokenMeaning, meaningClips.length) - 1];
  const explaining = meaningFrom >= 0 && frame >= scene.clips[meaningFrom].from - 6 && frame < lastMeaning.from + lastMeaning.dur + 8;
  const length = scene.ar!.length;
  const arSize = length < 30 ? 92 : length < 90 ? 72 : length < 160 ? 58 : length < 185 ? 54 : 48;
  const textLength = scene.pron!.length + scene.meaning!.length;
  const body = textLength < 150 ? 46 : textLength < 290 ? 39 : textLength < 330 ? 35 : 32;
  const showFigure = !!scene.pose && length < 60;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Heading size={52}>{scene.heading}</Heading>
        {scene.repeat && <div style={{ ...rise(frame, 8), padding: "2px 28px", borderRadius: 999, border: `2px solid ${C.gold}`, color: C.goldStrong, fontFamily: BODY, fontWeight: 600, fontSize: 30 }}>{scene.repeat}</div>}
        {showFigure && <div style={{ ...rise(frame, 6), height: 262 }}><Figure pose={scene.pose!} size={202} /></div>}
      </div>
      <div style={rise(frame, 8)}>
        <Card label="আরবি" active={reciting}>
          <div dir="rtl" lang="ar" style={{ fontFamily: ARABIC, fontSize: arSize, lineHeight: 2.05, textAlign: "center", color: reciting ? C.goldStrong : C.text }}>{scene.ar}</div>
        </Card>
      </div>
      <div style={rise(frame, 14)}>
        <Card label="বাংলা উচ্চারণ" active={reciting}>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: body, lineHeight: 1.55, textAlign: "center", color: C.text }}>{scene.pron}</div>
        </Card>
      </div>
      <div style={rise(frame, 20)}>
        <Card label="অর্থ" active={explaining}>
          <div style={{ fontFamily: BODY, fontSize: body, lineHeight: 1.55, textAlign: "center", color: C.soft }}>{scene.meaning}</div>
        </Card>
      </div>
    </div>
  );
};

/** Seen from above: the qibla at the top, then the deceased, the imam and the rows. */
const Rows = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const person = (x: number, y: number, fill: string, key: string) => (
    <g key={key}>
      <ellipse cx={x} cy={y + 8} rx={30} ry={16} fill={fill} />
      <circle cx={x} cy={y} r={15} fill="#c99a72" />
    </g>
  );
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Heading>{scene.heading}</Heading>
      <div style={{ ...rise(frame, 6), alignSelf: "center" }}>
        <svg width={860} height={490} viewBox="0 0 860 490">
          <rect x={2} y={2} width={856} height={486} rx={34} fill={C.surface} stroke={C.lineStrong} strokeWidth={3} />
          <text x={430} y={52} textAnchor="middle" fill={C.goldStrong} fontFamily={BODY} fontWeight={700} fontSize={32}>↑ কিবলা ↑</text>
          <rect x={250} y={82} width={360} height={70} rx={35} fill="#f1ead8" stroke={C.gold} strokeWidth={3} />
          <circle cx={290} cy={117} r={22} fill="#d8cdb1" />
          <text x={470} y={128} textAnchor="middle" fill="#14100a" fontFamily={BODY} fontWeight={700} fontSize={32}>মাইয়্যিত</text>
          <path d="M 376 160 V 188" stroke={C.gold} strokeWidth={4} strokeDasharray="6 6" />
          <g opacity={ramp(frame, revealAt(scene, 1, 4))}>
            {person(376, 208, C.gold, "imam")}
            <text x={430} y={222} fill={C.goldStrong} fontFamily={BODY} fontWeight={700} fontSize={30}>ইমাম (বুক বরাবর)</text>
          </g>
          {[0, 1, 2].map((row) => (
            <g key={row} opacity={ramp(frame, revealAt(scene, 1, 4) + 14 + row * 12)}>
              <text x={60} y={308 + row * 70} fill={C.muted} fontFamily={BODY} fontSize={28}>{`কাতার ${digits(row + 1)}`}</text>
              {Array.from({ length: 7 }, (_, i) => person(226 + i * 86, 296 + row * 70, "#f1ead8", `${row}-${i}`))}
            </g>
          ))}
        </svg>
      </div>
      <Points scene={scene} size={32} gap={10} />
    </div>
  );
};

const Overview = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const groups = scene.groups!;
  const wide = groups.length === 2;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 }}>
      <Heading>{scene.heading}</Heading>
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 22 }}>
        {groups.map((group, i) => (
          <div key={group.title} style={{ ...rise(frame, revealAt(scene, i, groups.length)), flex: 1, display: "flex", flexDirection: wide ? "column" : "row", alignItems: wide ? "stretch" : "center", gap: wide ? 18 : 26, padding: wide ? "26px 24px" : "26px 34px", borderRadius: 30, background: C.surface, border: `3px solid ${C.lineStrong}` }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.onGold, background: C.gold, borderRadius: 999, padding: "8px 28px", textAlign: "center", whiteSpace: "nowrap" }}>{group.title}</div>
            {group.items.map((item, k) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: BODY, fontWeight: 600, fontSize: wide ? 36 : 44, lineHeight: 1.4, color: C.text, minHeight: wide ? 104 : undefined }}>
                {wide && <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 999, border: `2px solid ${C.gold}`, color: C.goldStrong, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{digits(k + 1)}</span>}
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Compare = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
      <Heading size={52}>{scene.heading}</Heading>
      {scene.columns!.map((column, i) => (
        <div key={column.title} style={{ ...rise(frame, i === 0 ? 14 : scene.clips[0].from + 26), padding: "26px 36px", borderRadius: 30, background: i ? C.raised : C.surface, border: `3px solid ${i ? C.gold : C.lineStrong}` }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, color: C.goldStrong, marginBottom: 8 }}>{column.title}</div>
          {column.lines.map((line) => (
            <div key={line} style={{ fontFamily: BODY, fontWeight: 500, fontSize: 38, lineHeight: 1.65, color: C.text }}>• {line}</div>
          ))}
        </div>
      ))}
      <div style={{ ...rise(frame, scene.clips[scene.clips.length - 1].from), padding: "18px 30px", borderRadius: 999, background: C.gold, color: C.onGold, fontFamily: BODY, fontWeight: 700, fontSize: 36, textAlign: "center" }}>{scene.footer}</div>
    </div>
  );
};

export const SceneBody = ({ scene, marks }: { scene: Scene; marks: number }) => {
  switch (scene.kind) {
    case "title":
    case "end":
      return <Title scene={scene} />;
    case "info":
      return <Info scene={scene} />;
    case "step":
      return <Step scene={scene} marks={marks} />;
    case "dua":
      return <Dua scene={scene} />;
    case "rows":
      return <Rows scene={scene} />;
    case "overview":
      return <Overview scene={scene} />;
    case "compare":
      return <Compare scene={scene} />;
  }
};
