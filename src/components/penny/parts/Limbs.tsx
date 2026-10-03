import { motion, type Transition } from "motion/react";
import { ARMS, C } from "./moods";
import type { PennyMood } from "../types";

const tween: Transition = { duration: 0.2, ease: "easeOut" };

interface Pose {
  l: number | number[];
  r: number | number[];
  t?: Transition;
}

function pose(mood: PennyMood, still: boolean): Pose {
  const a = ARMS[mood];
  if (still) return { l: a.l, r: a.r };
  if (mood === "wave") {
    const b = a.r;
    return {
      l: a.l,
      r: [b, b - 25, b + 25, b - 25, b + 25, b - 25, b + 25, b - 25, b + 25, b, -18],
      t: { duration: 3.2, ease: "easeInOut", times: [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.86, 1] },
    };
  }
  if (mood === "meh") {
    return {
      l: [a.l, 55, 55, a.l],
      r: [a.r, -55, -55, a.r],
      t: { duration: 1.1, ease: "easeInOut", times: [0, 0.3, 0.6, 1] },
    };
  }
  return { l: a.l, r: a.r };
}

function Arm({ x, deg, t }: { x: number; deg: number | number[]; t?: Transition }) {
  return (
    <g transform={`translate(${x} 120)`}>
      <motion.g animate={{ rotate: deg }} transition={t ?? tween} style={{ originX: 0.5, originY: 0 }}>
        <rect x={-7} y={0} width={14} height={34} rx={7} fill={C.shade} />
      </motion.g>
    </g>
  );
}

/** Drawn behind the body so the shoulders tuck under it. */
export function Arms({ mood, still }: { mood: PennyMood; still: boolean }) {
  const p = pose(mood, still);
  return (
    <g>
      <Arm x={28} deg={p.l} t={p.t} />
      <Arm x={172} deg={p.r} t={p.t} />
    </g>
  );
}

export function Feet() {
  return (
    <g>
      <ellipse cx={82} cy={192} rx={11} ry={7} fill={C.ink} />
      <ellipse cx={118} cy={192} rx={11} ry={7} fill={C.ink} />
    </g>
  );
}
