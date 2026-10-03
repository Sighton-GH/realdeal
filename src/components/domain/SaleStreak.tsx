// STUB (SPEC-00). SCR-12 replaces; props are final.
import type { PricePoint } from "@shared/types";

export interface SaleStreakProps { points: PricePoint[]; weeks?: number; className?: string }

export function SaleStreak({ points, weeks = 12, className }: SaleStreakProps) {
  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      {points.slice(-weeks).map((p) => (
        <span key={p.date} title={p.date} className={`h-3.5 w-3.5 rounded-[4px] ${p.onSale ? "bg-grape-500" : "border-[1.5px] border-line bg-sunken"}`} />
      ))}
    </div>
  );
}
