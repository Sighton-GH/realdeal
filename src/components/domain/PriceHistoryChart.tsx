// STUB (SPEC-00). SCR-11 replaces with the d3 + SVG chart; props are final.
import type { ItemDetail, RetailerId, VerdictTier } from "@shared/types";

export interface PriceHistoryChartProps {
  detail: ItemDetail; mode: "unit" | "package"; focusRetailer?: RetailerId;
  compact?: boolean; markPrice?: number; markTier?: VerdictTier; className?: string;
}

export function PriceHistoryChart({ detail, compact, className }: PriceHistoryChartProps) {
  return (
    <div className={`flex items-center justify-center rounded-md bg-sunken text-small text-ink-soft ${compact ? "h-[140px]" : "h-[240px]"} ${className ?? ""}`}>
      Price chart for {detail.item.name}
    </div>
  );
}
