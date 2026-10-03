import { cn } from "@/lib/cn";
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { useEffect, useState } from "react";
import { Face } from "./parts/Face";
import { Arms, Feet } from "./parts/Limbs";
import { Stars, ThinkingDots } from "./parts/Extras";
import type { PennyMood } from "./types";

export interface PennyProps {
  mood: PennyMood;
  size?: number;
  className?: string;
}

const REST = { x: 0, y: 0, rotate: 0, scaleY: 1 };
const ease = "easeInOut" as const;

interface Motion {
  animate: TargetAndTransition;
  transition: Transition;
}

/** Whole-body motion in viewBox units, so distances scale with `size`. */
function body(mood: PennyMood, still: boolean): Motion {
  const quick: Transition = { duration: 0.2, ease: "easeOut" };
  if (still) {
    const pose = mood === "sad" ? { y: 4 } : mood === "suspicious" ? { rotate: 6 } : {};
    return { animate: { ...REST, ...pose }, transition: quick };
  }
  switch (mood) {
    case "idle":
    case "wave":
      return {
        animate: { ...REST, y: [0, -4, 0] },
        transition: { default: quick, y: { duration: 2.4, repeat: Infinity, ease } },
      };
    case "thinking":
      return {
        animate: { ...REST, rotate: [-4, 4, -4] },
        transition: { default: quick, rotate: { duration: 5, repeat: Infinity, ease } },
      };
    case "happy":
      return { animate: { ...REST, y: [0, -10, 0] }, transition: { default: quick, y: { duration: 0.5, ease } } };
    case "celebrate":
      return {
        animate: { ...REST, y: [0, -28, 0, 0], scaleY: [1, 1, 0.9, 1] },
        transition: {
          default: quick,
          y: { duration: 0.9, times: [0, 0.45, 0.78, 1], ease },
          scaleY: { duration: 0.9, times: [0, 0.45, 0.78, 1], ease },
        },
      };
    case "meh":
      return { animate: REST, transition: quick };
    case "suspicious":
      return { animate: { ...REST, rotate: 6 }, transition: quick };
    case "shocked":
      return {
        animate: { ...REST, x: [0, -3, 3, -3, 3, -3, 3, 0] },
        transition: { default: quick, x: { duration: 0.6, ease: "linear" } },
      };
    case "sad":
      return { animate: { ...REST, y: 4 }, transition: { default: quick, y: { duration: 1.2, ease } } };
  }
}

/** Blinks every 3 to 5 seconds (randomised). Allowed under reduced motion. */
function useBlink(): boolean {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let wait: ReturnType<typeof setTimeout>;
    let shut: ReturnType<typeof setTimeout>;
    const next = () => {
      wait = setTimeout(() => {
        setBlink(true);
        shut = setTimeout(() => {
          setBlink(false);
          next();
        }, 140);
      }, 3000 + Math.random() * 2000);
    };
    next();
    return () => {
      clearTimeout(wait);
      clearTimeout(shut);
    };
  }, []);
  return blink;
}

export function Penny({ mood, size = 120, className }: PennyProps) {
  const reduced = useReducedMotion() === true;
  const blink = useBlink();
  const m = body(mood, reduced);

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      role="img"
      aria-label={`Penny looks ${mood}`}
      className={cn("shrink-0", className)}
      overflow="visible"
    >
      <motion.g animate={m.animate} transition={m.transition} style={{ originX: 0.5, originY: 0.9 }}>
        <Arms mood={mood} still={reduced} />
        <Feet />
        <Face mood={mood} blink={blink} still={reduced} />
      </motion.g>
      {mood === "thinking" && <ThinkingDots still={reduced} />}
      {mood === "celebrate" && <Stars still={reduced} />}
    </svg>
  );
}
