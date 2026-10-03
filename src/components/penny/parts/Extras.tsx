import { motion } from "motion/react";
import { C } from "./moods";

const STAR = "M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z";

const STARS = [
  { x: 22, y: 34, s: 1.1, c: C.grape, d: 0.15 },
  { x: 180, y: 40, s: 1.3, c: C.yellow, d: 0.25 },
  { x: 14, y: 96, s: 0.8, c: C.yellow, d: 0.35 },
  { x: 188, y: 100, s: 0.9, c: C.grape, d: 0.45 },
];

/** Four small 4-point stars that pop once. */
export function Stars({ still }: { still: boolean }) {
  return (
    <g>
      {STARS.map((st) => (
        <g key={`${st.x}-${st.y}`} transform={`translate(${st.x} ${st.y})`}>
          <motion.path
            d={STAR}
            fill={st.c}
            initial={still ? false : { scale: 0, rotate: -40 }}
            animate={{ scale: st.s, rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 16, delay: still ? 0 : st.d }}
          />
        </g>
      ))}
    </g>
  );
}

/** Three dots popping above the head in sequence, looping. */
export function ThinkingDots({ still }: { still: boolean }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${128 + i * 17} ${18 - i * 4})`}>
          <motion.circle
            r={4 + i}
            fill={C.grape}
            initial={false}
            animate={still ? { scale: 1, opacity: 1 } : { scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={still ? undefined : { duration: 2.4, repeat: Infinity, delay: i * 0.4, times: [0, 0.15, 0.8, 1] }}
          />
        </g>
      ))}
    </g>
  );
}
