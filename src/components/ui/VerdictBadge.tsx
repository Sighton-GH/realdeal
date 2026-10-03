// STUB (SPEC-00). UI-02 replaces; props are final.
import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";
import { tierMeta } from "@/lib/tier";

export interface VerdictBadgeProps { tier: VerdictTier; size?: "sm" | "md"; className?: string }

export function VerdictBadge({ tier, size = "sm", className }: VerdictBadgeProps) {
  const meta = tierMeta[tier];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-extrabold", meta.tintClass, meta.textClass, size === "sm" ? "h-7 px-2.5 text-micro" : "h-9 px-3.5 text-small", className)}>
      <Icon weight="fill" size={size === "sm" ? 14 : 18} />
      {meta.shortLabel}
    </span>
  );
}
