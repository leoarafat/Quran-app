import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, H, W } from "./theme";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ramp = (frame: number, from: number, length = 14) => interpolate(frame, [from, from + length], [0, 1], CLAMP);
const ease = (t: number) => 1 - (1 - t) ** 3;
export const rise = (frame: number, from: number, distance = 28) => {
  const t = ease(ramp(frame, from, 18));
  return { opacity: t, transform: `translateY(${(1 - t) * distance}px)` };
};

export const digits = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** Night sky with a slow geometric lattice. */
export const Backdrop = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 75% at 50% 0%, #123b2c 0%, ${C.bg} 62%)` }}>
      <svg width={W} height={H} style={{ opacity: 0.07 }}>
        <defs>
          <pattern id="star" width={180} height={180} patternUnits="userSpaceOnUse" patternTransform={`translate(${(frame * 0.12) % 180} ${(frame * 0.08) % 180})`}>
            <g fill="none" stroke={C.goldStrong} strokeWidth={1.6}>
              <rect x={50} y={50} width={80} height={80} />
              <rect x={50} y={50} width={80} height={80} transform="rotate(45 90 90)" />
              <path d="M 0 90 H 34 M 146 90 H 180 M 90 0 V 34 M 90 146 V 180" />
            </g>
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#star)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Crescent = ({ size = 96 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <mask id="moon">
      <rect width={100} height={100} fill="white" />
      <circle cx={64} cy={40} r={34} fill="black" />
    </mask>
    <circle cx={46} cy={52} r={40} fill={C.gold} mask="url(#moon)" />
    <path d="M 72 24 l 4 11 11 4 -11 4 -4 11 -4 -11 -11 -4 11 -4 z" fill={C.goldStrong} />
  </svg>
);
