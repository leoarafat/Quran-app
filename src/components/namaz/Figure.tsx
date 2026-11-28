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

/* Women's figure: same style, long loose dress and head covering. Drawn only in this app, not part of the videos. */
const DRESS = "#7d6b8f";
const DRESS_SHADE = "#665676";
const VEIL = "#93819f";
const LINE = "#463a55";

const Cloth = ({ d, width = 40, fill = DRESS }: { d: string; width?: number; fill?: string }) => (
  <>
    <path d={d} fill="none" stroke={LINE} strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={fill} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const WomanFront = ({ pose }: { pose: Pose }) => {
  const turn = pose === "salamR" ? 1 : pose === "salamL" ? -1 : 0;
  return (
    <g>
      <path d="M 148 152 C 160 134 240 134 252 152 L 280 480 C 232 492 168 492 120 480 Z" fill={DRESS} stroke={LINE} strokeWidth={3} />
      <path d="M 134 118 C 132 20 268 20 266 118 C 270 190 292 214 300 232 C 244 262 156 262 100 232 C 108 214 130 190 134 118 Z" fill={VEIL} stroke={LINE} strokeWidth={3} />
      <ellipse cx={200 + turn * 14} cy={94} rx={29} ry={34} fill={SKIN} />
      {turn !== 0 && <path d={`M ${200 + turn * 40} 88 q ${turn * 18} 11 0 18 z`} fill={SKIN} />}
      {pose === "takbir" ? (
        <>
          <Cloth d="M 150 190 L 108 262 L 118 196" width={32} />
          <Cloth d="M 250 190 L 292 262 L 282 196" width={32} />
          <Hand x={118} y={166} r={-4} rx={13} ry={24} />
          <Hand x={282} y={166} r={4} rx={13} ry={24} />
        </>
      ) : pose === "fold" ? (
        <>
          <Cloth d="M 144 196 L 126 252 L 182 222" width={32} />
          <Cloth d="M 256 196 L 274 252 L 218 218" width={32} />
          <Hand x={193} y={217} r={76} />
          <Hand x={208} y={208} r={-76} />
        </>
      ) : (
        <>
          <Cloth d="M 140 196 L 122 276 L 124 330" width={30} />
          <Cloth d="M 260 196 L 278 276 L 276 330" width={30} />
          <Hand x={124} y={354} r={4} />
          <Hand x={276} y={354} r={-4} />
        </>
      )}
      {turn !== 0 && (
        <g stroke="#ebcb88" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={turn < 0 ? "translate(400 0) scale(-1 1)" : undefined}>
          <path d="M 268 30 C 316 28 344 56 346 94" />
          <path d="M 326 76 L 347 98 L 366 72" />
        </g>
      )}
    </g>
  );
};

const VeilHead = ({ x, y, angle }: { x: number; y: number; angle: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M 24 -6 q 20 10 0 18 z" fill={SKIN} />
    <ellipse cx={6} rx={25} ry={31} fill={SKIN} />
    <path d="M -46 26 C -56 -52 34 -56 30 -16 C 4 -20 -6 6 4 40 C -14 48 -34 42 -46 26 Z" fill={VEIL} stroke={LINE} strokeWidth={2.5} />
  </g>
);

/** Bends less than a man, arms close to the body. */
const WomanRuku = () => (
  <g>
    <ellipse cx={176} cy={476} rx={34} ry={12} fill={SKIN} />
    <Cloth d="M 160 330 L 164 456" width={76} fill={DRESS_SHADE} />
    <Cloth d="M 162 322 L 268 258" width={84} />
    <VeilHead x={320} y={246} angle={18} />
    <Cloth d="M 256 274 L 222 340 L 194 386" width={28} />
    <Hand x={188} y={398} r={36} />
  </g>
);

/** Drawn close together: belly against thighs, arms against the sides, forearms down, feet to one side. */
const WomanSujud = () => (
  <g>
    <ellipse cx={92} cy={474} rx={32} ry={11} fill={SKIN} />
    <Cloth d="M 118 466 L 238 466" width={40} fill={DRESS_SHADE} />
    <Cloth d="M 158 442 L 286 450" width={66} />
    <VeilHead x={336} y={456} angle={52} />
    <Cloth d="M 252 456 L 270 476 L 336 482" width={22} />
    <Hand x={358} y={483} r={90} rx={8} ry={20} />
  </g>
);

const WomanSit = () => (
  <g>
    <ellipse cx={102} cy={474} rx={34} ry={11} fill={SKIN} />
    <Cloth d="M 128 466 L 268 462" width={42} fill={DRESS_SHADE} />
    <Cloth d="M 178 436 L 280 448" width={56} />
    <Cloth d="M 180 432 L 190 292" width={82} />
    <VeilHead x={198} y={224} angle={6} />
    <Cloth d="M 192 298 L 204 380 L 258 422" width={28} />
    <Hand x={274} y={428} r={-72} />
  </g>
);

/** Common mistakes, shown only beside the right way. */
export type Mistake = "takbirLow" | "rukuBent" | "sujudElbows" | "sujudFeet";

const Mistaken = ({ kind }: { kind: Mistake }) => {
  if (kind === "takbirLow")
    return (
      <g>
        <FrontBody />
        <Limb d="M 158 170 L 122 250 L 128 300" width={36} />
        <Limb d="M 242 170 L 278 250 L 272 300" width={36} />
        <Hand x={128} y={322} r={-20} />
        <Hand x={272} y={322} r={20} />
        <FrontHead />
      </g>
    );
  if (kind === "rukuBent")
    return (
      <g>
        <ellipse cx={162} cy={476} rx={36} ry={13} fill={SKIN} />
        <Limb d="M 140 310 L 160 390 L 146 458" width={64} fill={ROBE_SHADE} />
        <Limb d="M 138 304 Q 214 196 288 322" width={78} />
        <SideHead x={318} y={380} angle={62} />
        <Limb d="M 262 304 L 252 384 L 214 420" width={30} />
        <Hand x={206} y={430} r={46} />
      </g>
    );
  if (kind === "sujudElbows")
    return (
      <g>
        <ellipse cx={74} cy={462} rx={15} ry={24} fill={SKIN} transform="rotate(24 74 462)" />
        <Limb d="M 96 458 L 196 458" width={40} fill={ROBE_SHADE} />
        <Limb d="M 194 456 L 144 394" width={58} fill={ROBE_SHADE} />
        <Limb d="M 146 392 L 276 440" width={74} />
        <SideHead x={338} y={452} angle={58} />
        <Limb d="M 262 450 L 246 482 L 350 482" width={26} />
        <Hand x={372} y={483} r={90} rx={9} ry={21} />
      </g>
    );
  return (
    <g>
      <Limb d="M 82 372 L 196 458" width={40} fill={ROBE_SHADE} />
      <ellipse cx={68} cy={352} rx={15} ry={24} fill={SKIN} transform="rotate(-52 68 352)" />
      <Limb d="M 194 456 L 144 376" width={58} fill={ROBE_SHADE} />
      <Limb d="M 146 374 L 276 428" width={74} />
      <SideHead x={338} y={448} angle={58} />
      <Limb d="M 266 428 L 280 468 L 334 478" width={26} />
      <Hand x={356} y={480} r={90} rx={9} ry={21} />
    </g>
  );
};

/** The man's sujud with the elbow clearly off the ground, for the side-by-side with the mistake. */
const SujudElbowUp = () => (
  <g>
    <ellipse cx={74} cy={462} rx={15} ry={24} fill={SKIN} transform="rotate(24 74 462)" />
    <Limb d="M 96 458 L 196 458" width={40} fill={ROBE_SHADE} />
    <Limb d="M 194 456 L 144 362" width={58} fill={ROBE_SHADE} />
    <Limb d="M 146 360 L 280 408" width={72} />
    <SideHead x={340} y={448} angle={58} />
    <Limb d="M 268 412 L 288 436 L 350 474" width={24} />
    <Hand x={366} y={481} r={90} rx={9} ry={21} />
  </g>
);

/** Where to look in each wrong picture: centre and radius of the red ring. */
const SPOT: Record<Mistake, [x: number, y: number, r: number]> = {
  takbirLow: [128, 316, 40],
  rukuBent: [212, 262, 52],
  sujudElbows: [252, 480, 34],
  sujudFeet: [72, 358, 40],
};

const LOW_POSES: readonly Pose[] = ["ruku", "sujud", "sit"];

const body = (pose: Pose, woman?: boolean) => {
  if (pose === "ruku") return woman ? <WomanRuku /> : <Ruku />;
  if (pose === "sujud") return woman ? <WomanSujud /> : <Sujud />;
  if (pose === "sit") return woman ? <WomanSit /> : <Sit />;
  return woman ? <WomanFront pose={pose} /> : <Front pose={pose} />;
};

export const Figure = ({ pose, woman, mistake, elbowUp, label }: { pose: Pose; woman?: boolean; mistake?: Mistake; elbowUp?: boolean; label?: string }) => (
  <svg className="h-auto w-full" viewBox={LOW_POSES.includes(pose) ? "0 160 400 360" : "0 0 400 520"} role="img" aria-label={label ?? (woman ? `নারী: ${POSE_NAMES[pose]}` : POSE_NAMES[pose])}>
    <ellipse cx={200} cy={490} rx={186} ry={22} fill="#0a3226" stroke="#d9b46a" strokeWidth={3} />
    <ellipse cx={200} cy={490} rx={160} ry={14} fill="none" stroke="#d9b46a" strokeWidth={1.5} opacity={0.6} />
    {mistake ? <Mistaken kind={mistake} /> : elbowUp ? <SujudElbowUp /> : body(pose, woman)}
    {mistake && <circle cx={SPOT[mistake][0]} cy={SPOT[mistake][1]} r={SPOT[mistake][2]} fill="none" stroke="#c0392b" strokeWidth={7} strokeDasharray="14 9" />}
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
