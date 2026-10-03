// STUB (SPEC-00). UI-03 replaces; props are final.
import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";
import { tierMeta } from "@/lib/tier";

export interface ProgressBarProps { value: number; tone?: "brand" | VerdictTier; height?: 12 | 16; label?: string; className?: string }

export function ProgressBar({ value, tone = "brand", height = 16, label, className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} className={cn("w-full overflow-hidden rounded-full bg-sunken", className)} style={{ height }}>
      <div className={cn("h-full rounded-full transition-[width] duration-300", tone === "brand" ? "bg-grape-500" : tierMeta[tone].bgClass)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}
