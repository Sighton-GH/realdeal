import { motion, useReducedMotion } from "motion/react";
import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export interface PriceGaugeProps { pctVsAvg: number; tier: VerdictTier; animate?: boolean; compact?: boolean; className?: string }

const MINUS = "\u2212";
const RANGE_WORD: Record<VerdictTier, string> = {
  steal: "steal",
  good: "good deal",
  normal: "normal",
  high: "overpriced",
};

/** Track runs from -50% to +50%; clamp, then map to 0..100 (% of track width). */
function toPosition(pct: number): number {
  const clamped = Math.max(-0.5, Math.min(0.5, Number.isFinite(pct) ? pct : 0));
  return (clamped + 0.5) * 100;
}

function pctLabel(pct: number): string {
  if (Math.abs(pct) <= 0.005) return "avg";
  const n = Math.round(Math.abs(pct) * 100);
  return `${pct < 0 ? MINUS : "+"}${n}%`;
}

function ariaFor(pct: number, tier: VerdictTier): string {
  const range = `in the ${RANGE_WORD[tier]} range`;
  if (Math.abs(pct) <= 0.005) return `Right at the 90-day average, ${range}`;
  const n = Math.round(Math.abs(pct) * 100);
  return `${n}% ${pct < 0 ? "below" : "above"} the 90-day average, ${range}`;
}

export function PriceGauge({ pctVsAvg, tier, animate, compact, className }: PriceGaugeProps) {
  const reduce = useReducedMotion();
  const x = toPosition(pctVsAvg);
  const spin = Boolean(animate) && !reduce;
  const markerSize = compact ? "size-4" : "size-7";

  return (
    <div role="img" aria-label={ariaFor(pctVsAvg, tier)} className={cn(compact ? "px-2 py-1" : "px-5", className)}>
      <div className={cn("relative", !compact && "pt-8")}>
        <div className={cn("relative flex w-full overflow-hidden rounded-full", compact ? "h-3" : "h-5")}>
          <div className="h-full bg-steal" style={{ width: "25%" }} />
          <div className="h-full bg-good" style={{ width: "15%" }} />
          <div className="h-full bg-normal" style={{ width: "20%" }} />
          <div className="h-full bg-high" style={{ width: "40%" }} />
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-canvas" />
        </div>

        <motion.div
          className={cn("absolute w-0", compact ? "top-1 h-3" : "top-8 h-5")}
          initial={{ left: spin ? "50%" : `${x}%` }}
          animate={{ left: `${x}%` }}
          transition={spin ? { ...spring.pop, delay: 0.3 } : { duration: 0 }}
        >
          {!compact && (
            <>
              <span className="absolute bottom-[calc(100%+8px)] left-0 -translate-x-1/2 whitespace-nowrap font-display text-small font-semibold text-ink tabular">
                {pctLabel(pctVsAvg)}
              </span>
              <span className="absolute left-0 top-[22px] size-2 -translate-x-1/2 rotate-45 bg-ink" />
            </>
          )}
          <span className={cn("absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-canvas", markerSize)} />
        </motion.div>
      </div>

      {!compact && (
        <div className="relative mt-3 h-5">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-micro text-ink-soft">avg</span>
        </div>
      )}
    </div>
  );
}
