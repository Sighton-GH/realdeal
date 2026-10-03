// STUB (SPEC-00). SCR-09 replaces; props are final.
import type { VerdictTier } from "@shared/types";
import { formatPct } from "@/lib/format";

export interface PriceGaugeProps { pctVsAvg: number; tier: VerdictTier; animate?: boolean; compact?: boolean; className?: string }

export function PriceGauge({ pctVsAvg, tier, compact, className }: PriceGaugeProps) {
  const x = ((Math.max(-0.5, Math.min(0.5, pctVsAvg)) + 0.5) / 1) * 100;
  return (
    <div role="img" aria-label={`${formatPct(pctVsAvg)}, ${tier}`} className={className}>
      <div className={`relative flex overflow-hidden rounded-full ${compact ? "h-3" : "h-5"}`}>
        <div className="bg-steal" style={{ width: "25%" }} />
        <div className="bg-good" style={{ width: "15%" }} />
        <div className="bg-normal" style={{ width: "20%" }} />
        <div className="bg-high" style={{ width: "40%" }} />
        <div className="absolute top-0 h-full w-1 bg-ink" style={{ left: `${x}%` }} />
      </div>
    </div>
  );
}
