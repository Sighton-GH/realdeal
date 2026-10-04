import { motion } from "motion/react";
import type { Verdict } from "@shared/types";
import { Penny } from "@/components/penny";
import { cn } from "@/lib/cn";
import { formatPct } from "@/lib/format";
import { spring } from "@/lib/motion";
import { tierMeta } from "@/lib/tier";
import type { RevealPhase } from "../useRevealSequence";
import { Counter } from "./Counter";
import { Stars } from "./Stars";

export interface StageProps {
  verdict: Verdict;
  phase: RevealPhase;
  suspicious: boolean;
  runId: number;
  reduced: boolean;
}

/** The coloured stage: suspense, slam, then the shrunk header above the result panel. */
export function Stage({ verdict, phase, suspicious, runId, reduced }: StageProps) {
  const meta = tierMeta[verdict.tier];
  const revealed = phase === "slam" || phase === "result";
  const compact = phase === "result";
  const pennyMood = revealed ? (suspicious ? "suspicious" : meta.mood) : "thinking";
  const pennySize = revealed ? (compact ? 120 : 180) : 160;

  return (
    <motion.div
      className="absolute inset-x-0 top-0 overflow-hidden bg-grape-900"
      initial={false}
      animate={{ height: compact ? "40%" : "100%" }}
      transition={reduced ? { duration: 0 } : spring.sheet}
    >
      {revealed && (
        <motion.div
          key={`wipe-${runId}`}
          aria-hidden="true"
          className={cn("absolute inset-0", meta.bgClass)}
          initial={reduced ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "circle(150% at 50% 50%)" }}
          transition={reduced ? { duration: 0.15 } : { duration: 0.45, ease: "easeOut" }}
        />
      )}
      {reduced && revealed && <Stars />}

      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5 pt-10 text-center">
        {!revealed && (
          <Penny mood={pennyMood} size={pennySize} />
        )}

        {phase === "suspense" && (
          <>
            <h2 className="font-display text-h2 font-semibold text-white">Checking {verdict.item.name}…</h2>
            <div key={`counters-${runId}`} className="flex flex-col items-center gap-0.5">
              <Counter from={1} to={4} seconds={1} label="Stores checked" />
              <Counter from={0} to={verdict.dataPoints} seconds={1.1} label="Prices compared" />
            </div>
          </>
        )}

        {revealed && (
          <>
            <Penny mood={pennyMood} size={pennySize} />
            <motion.h1
              key={`word-${runId}`}
              className={cn(
                "font-display font-bold",
                meta.textOnFaceClass,
                compact ? "text-[2.5rem] leading-none md:text-[3.15rem]" : "text-verdict md:text-[4.5rem]",
              )}
              initial={reduced ? { opacity: 0 } : { scale: 2.2, rotate: -6, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
              transition={reduced ? { duration: 0.15 } : { ...spring.slam, opacity: { duration: 0.1 } }}
            >
              {meta.label}
            </motion.h1>
            <h3 className={cn("font-body text-h3 font-extrabold", meta.textOnFaceClass)}>{formatPct(verdict.pctVsAvg)}</h3>
          </>
        )}
      </div>
    </motion.div>
  );
}
