export type Pose = "stand" | "takbir" | "fold" | "ruku" | "sujud" | "sit" | "salamR" | "salamL";

/** Copied from the lesson videos (video/src/Figure.tsx). A faceless praying figure. Front view for standing; side view (facing the qibla, to the right) for the rest. */
const ROBE = "#f1ead8";
const ROBE_SHADE = "#d8cdb1";
const EDGE = "#8f8466";
const SKIN = "#c99a72";
const CAP = "#d9b46a";

const Limb = ({ d, width = 40, fill = ROBE }: { d: string; width?: number; fill?: string }) => (
  <>
    <path d={d} fill="none" stroke={EDGE} strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={fill} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const Hand = ({ x, y, r = 0, rx = 13, ry = 20 }: { x: number; y: number; r?: number; rx?: number; ry?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={SKIN} stroke="#8c6445" strokeWidth={2} transform={`rotate(${r} ${x} ${y})`} />
);

const FrontHead = ({ turn = 0 }: { turn?: number }) => (
  <g>
    <rect x={186} y={112} width={28} height={30} rx={10} fill={SKIN} />
    {turn !== 0 && <path d={`M ${200 + turn * 34} 82 q ${turn * 20} 12 0 20 z`} fill={SKIN} />}
    <ellipse cx={200 + turn * 6} cy={88} rx={35} ry={39} fill={SKIN} />
    <path d={`M ${164 + turn * 6} 76 C ${165 + turn * 6} 32 ${235 + turn * 6} 32 ${236 + turn * 6} 76 C ${215 + turn * 6} 66 ${185 + turn * 6} 66 ${164 + turn * 6} 76 Z`} fill={CAP} />
    <path d={`M ${171 + turn * 28} 98 C ${175 + turn * 22} 142 ${225 + turn * 22} 142 ${229 + turn * 28} 98 C ${214 + turn * 26} 116 ${186 + turn * 26} 116 ${171 + turn * 28} 98 Z`} fill="#3b2c20" />
  </g>
);

const FrontBody = () => (
  <g>
    <ellipse cx={172} cy={478} rx={25} ry={12} fill={SKIN} />
    <ellipse cx={228} cy={478} rx={25} ry={12} fill={SKIN} />
    <path d="M 148 152 C 160 134 240 134 252 152 L 270 458 C 230 470 170 470 130 458 Z" fill={ROBE} stroke={EDGE} strokeWidth={3} />
    <path d="M 200 142 L 200 250" stroke={ROBE_SHADE} strokeWidth={4} />
    <path d="M 182 300 L 172 456 M 218 300 L 228 456" stroke={ROBE_SHADE} strokeWidth={3} opacity={0.7} />
  </g>
);

const Front = ({ pose }: { pose: Pose }) => {
  const turn = pose === "salamR" ? 1 : pose === "salamL" ? -1 : 0;
  return (
    <g>
      <FrontBody />
      {pose === "takbir" ? (
        <>
          <Limb d="M 158 170 L 100 232 L 132 140" width={36} />
          <Limb d="M 242 170 L 300 232 L 268 140" width={36} />
          <Hand x={134} y={104} r={-6} rx={15} ry={28} />
          <Hand x={266} y={104} r={6} rx={15} ry={28} />
        </>
      ) : pose === "fold" ? (
        <>
          <Limb d="M 158 170 L 126 262 L 186 284" width={36} />
          <Limb d="M 242 170 L 274 262 L 214 280" width={36} />
          <Hand x={194} y={286} r={78} />
          <Hand x={208} y={276} r={-78} />
        </>
      ) : (
        <>
          <Limb d="M 156 170 L 126 252 L 120 322" width={36} />
          <Limb d="M 244 170 L 274 252 L 280 322" width={36} />
          <Hand x={119} y={348} r={6} />
          <Hand x={281} y={348} r={-6} />
        </>
      )}
      <FrontHead turn={turn} />
      {turn !== 0 && (
        <g stroke="#ebcb88" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={turn < 0 ? "translate(400 0) scale(-1 1)" : undefined}>
          <path d="M 252 34 C 300 28 332 52 334 92" />
          <path d="M 314 74 L 335 96 L 354 70" />
        </g>
      )}
    </g>
  );
};

const SideHead = ({ x, y, angle }: { x: number; y: number; angle: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M 26 -6 q 20 10 0 18 z" fill={SKIN} />
    <ellipse rx={32} ry={35} fill={SKIN} />
    <path d="M -34 -10 C -34 -50 32 -52 33 -12 C 12 -22 -12 -20 -34 -10 Z" fill={CAP} />
    <path d="M 2 14 C 6 48 34 44 31 12 C 22 24 12 24 2 14 Z" fill="#3b2c20" />
  </g>
);

const Ruku = () => (
  <g>
    <ellipse cx={162} cy={476} rx={36} ry={13} fill={SKIN} />
    <Limb d="M 135 290 L 146 458" width={64} fill={ROBE_SHADE} />
    <Limb d="M 135 282 L 282 274" width={82} />
    <SideHead x={347} y={284} angle={22} />
    <Limb d="M 266 288 L 210 330 L 164 366" width={30} />
    <Hand x={154} y={376} r={48} />
  </g>
);

const Sujud = () => (
  <g>
    <ellipse cx={74} cy={462} rx={15} ry={24} fill={SKIN} transform="rotate(24 74 462)" />
    <Limb d="M 96 458 L 196 458" width={40} fill={ROBE_SHADE} />
    <Limb d="M 194 456 L 144 376" width={58} fill={ROBE_SHADE} />
    <Limb d="M 146 374 L 276 428" width={74} />
    <SideHead x={338} y={448} angle={58} />
    <Limb d="M 266 428 L 280 468 L 334 478" width={26} />
    <Hand x={356} y={480} r={90} rx={9} ry={21} />
  </g>
);

const Sit = () => (
  <g>
    <ellipse cx={104} cy={470} rx={30} ry={13} fill={SKIN} />
    <Limb d="M 270 464 L 128 464" width={36} fill={ROBE_SHADE} />
    <Limb d="M 170 428 L 278 450" width={58} />
    <Limb d="M 170 424 L 186 286" width={80} />
    <SideHead x={196} y={214} angle={6} />
    <Limb d="M 188 292 L 200 380 L 256 424" width={30} />
    <Hand x={272} y={430} r={-72} />
  </g>
);

export const Figure = ({ pose }: { pose: Pose }) => (
  <svg className="h-auto w-full" viewBox={pose === "ruku" || pose === "sujud" || pose === "sit" ? "0 160 400 360" : "0 0 400 520"} role="img" aria-label={POSE_NAMES[pose]}>
    <ellipse cx={200} cy={490} rx={186} ry={22} fill="#0a3226" stroke="#d9b46a" strokeWidth={3} />
    <ellipse cx={200} cy={490} rx={160} ry={14} fill="none" stroke="#d9b46a" strokeWidth={1.5} opacity={0.6} />
    {pose === "ruku" ? <Ruku /> : pose === "sujud" ? <Sujud /> : pose === "sit" ? <Sit /> : <Front pose={pose} />}
  </svg>
);

export const POSE_NAMES: Record<Pose, string> = {
  stand: "দাঁড়ানো",
  takbir: "তাকবির: হাত তোলা",
  fold: "হাত বাঁধা",
  ruku: "রুকু",
  sujud: "সিজদা",
  sit: "বৈঠক",
  salamR: "ডানে সালাম",
  salamL: "বামে সালাম",
};
