import type { VerdictTier } from "@shared/types";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { tierMeta } from "@/lib/tier";

export interface ProgressBarProps { value: number; tone?: "brand" | VerdictTier; height?: 12 | 16; label?: string; className?: string }

export function ProgressBar({ value, tone = "brand", height = 16, label, className }: ProgressBarProps) {
  const reduce = useReducedMotion();
  const v = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  const width = `${v * 100}%`;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn("w-full overflow-hidden rounded-full bg-sunken", className)}
      style={{ height }}
    >
      <motion.div
        className={cn("relative h-full rounded-full", tone === "brand" ? "bg-grape-500" : tierMeta[tone].bgClass)}
        initial={reduce ? false : { width: "0%" }}
        animate={{ width }}
        transition={reduce ? { duration: 0.15 } : spring.pop}
      >
        <span aria-hidden className="absolute left-1 right-1 top-[2px] h-[33%] rounded-full bg-white/35" />
      </motion.div>
    </div>
  );
}
