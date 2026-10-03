import { motion } from "motion/react";
import { useId } from "react";
import { C, FACES } from "./moods";
import type { PennyMood } from "../types";

interface FaceProps {
  mood: PennyMood;
  /** Eyes closed for a blink (open-eye moods only). */
  blink?: boolean;
  /** Skip looping pupil motion. */
  still?: boolean;
}

const tween = { duration: 0.2, ease: "easeOut" } as const;

/** Coin body, shine, eyes, brows, cheeks and mouth in the 200x220 viewBox. */
export function Face({ mood, blink = false, still = false }: FaceProps) {
  const uid = useId().replace(/:/g, "");
  const f = FACES[mood];
  const arc = f.eyes === "arc";
  const slide = mood === "suspicious" && !still;
  const eyeY = blink && !arc ? 0.08 : 1;

  return (
    <g>
      <defs>
        <clipPath id={`${uid}-body`}>
          <circle cx={100} cy={108} r={78} />
        </clipPath>
        <clipPath id={`${uid}-eyeL`}>
          <ellipse cx={76} cy={98} rx={13} ry={16} />
        </clipPath>
        <clipPath id={`${uid}-eyeR`}>
          <ellipse cx={124} cy={98} rx={13} ry={16} />
        </clipPath>
        <clipPath id={`${uid}-mouth`}>
          <motion.path initial={false} animate={{ d: f.mouthOpen }} transition={tween} />
        </clipPath>
      </defs>

      {/* body */}
      <circle cx={100} cy={108} r={78} fill={C.copper} />
      <g clipPath={`url(#${uid}-body)`}>
        <path
          fillRule="evenodd"
          fill={C.shade}
          d="M -50 -50 H 250 V 270 H -50 Z M 81.6 89.6 m -78 0 a 78 78 0 1 0 156 0 a 78 78 0 1 0 -156 0 Z"
        />
      </g>
      <circle cx={100} cy={108} r={74} fill="none" stroke={C.shade} strokeOpacity={0.55} strokeWidth={8} />

      {/* shine */}
      <rect x={34} y={60} width={32} height={12} rx={6} fill={C.light} transform="rotate(-50 50 66)" />
      <circle cx={73} cy={44} r={5} fill={C.light} />

      {/* cheeks */}
      <motion.ellipse initial={false} animate={{ opacity: f.cheek }} transition={tween} cx={58} cy={116} rx={8} ry={4.5} fill={C.pink} />
      <motion.ellipse initial={false} animate={{ opacity: f.cheek }} transition={tween} cx={142} cy={116} rx={8} ry={4.5} fill={C.pink} />

      {/* open eyes */}
      <motion.g initial={false} animate={{ opacity: arc ? 0 : 1 }} transition={tween}>
        {([76, 124] as const).map((cx, i) => (
          <motion.g
            key={cx}
            initial={false}
            animate={{ scaleX: f.eyeSx, scaleY: f.eyeSy * eyeY }}
            transition={blink ? { duration: 0.07 } : tween}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <ellipse cx={cx} cy={98} rx={13} ry={16} fill={C.white} />
            <motion.g
              initial={false}
              animate={
                slide
                  ? { x: [-6, 6, -6], y: f.pupil.y, scale: f.pupil.scale }
                  : { x: f.pupil.x, y: f.pupil.y, scale: f.pupil.scale }
              }
              transition={slide ? { x: { duration: 4, repeat: Infinity, ease: "easeInOut" }, default: tween } : tween}
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <circle cx={cx} cy={98} r={9} fill={C.ink} />
              <circle cx={cx + 3} cy={94.5} r={2.6} fill={C.white} />
            </motion.g>
            <g clipPath={`url(#${uid}-eye${i === 0 ? "L" : "R"})`}>
              <motion.rect
                initial={false}
                animate={{ height: f.lid * 32 + 0.01 }}
                transition={tween}
                x={cx - 15}
                y={82}
                width={30}
                fill={C.copper}
              />
            </g>
          </motion.g>
        ))}
      </motion.g>

      {/* arc eyes */}
      <motion.path
        initial={false}
        animate={{ opacity: arc ? 1 : 0, d: f.arc }}
        transition={tween}
        fill="none"
        stroke={C.ink}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* brows */}
      {(
        [
          [76, f.browL],
          [124, f.browR],
        ] as const
      ).map(([cx, b]) => (
        <motion.rect
          key={cx}
          initial={false}
          animate={{ x: cx - 11, y: 67 + b.y, rotate: b.r }}
          transition={tween}
          width={22}
          height={6}
          rx={3}
          fill={C.ink}
          style={{ originX: 0.5, originY: 0.5 }}
        />
      ))}

      {/* mouth */}
      <motion.path
        initial={false}
        animate={{ d: f.mouthLine, opacity: f.open ? 0 : 1 }}
        transition={tween}
        fill="none"
        stroke={C.ink}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <motion.g initial={false} animate={{ opacity: f.open ? 1 : 0 }} transition={tween}>
        <motion.path initial={false} animate={{ d: f.mouthOpen }} transition={tween} fill={C.mouth} />
        <g clipPath={`url(#${uid}-mouth)`}>
          <motion.ellipse
            initial={false}
            animate={{ cx: f.tongue.x, cy: f.tongue.y, rx: f.tongue.rx, ry: f.tongue.ry, opacity: f.tongue.on ? 1 : 0 }}
            transition={tween}
            fill={C.pink}
          />
        </g>
      </motion.g>
    </g>
  );
}
