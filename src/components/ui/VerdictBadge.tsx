import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";
import { tierMeta } from "@/lib/tier";

export interface VerdictBadgeProps {
  tier: VerdictTier;
  size?: "sm" | "md";
  className?: string;
}

const faceText: Record<VerdictTier, string> = {
  steal: "text-steal",
  good: "text-good",
  normal: "text-normal",
  high: "text-high",
};

export function VerdictBadge({ tier, size = "sm", className }: VerdictBadgeProps) {
  const meta = tierMeta[tier];
  const TierIcon = meta.icon;
  const sm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-body font-extrabold whitespace-nowrap",
        meta.tintClass,
        tier === "normal" ? "text-ink" : meta.textClass,
        sm ? "h-7 gap-1 px-2.5 text-micro" : "h-9 gap-1.5 px-3 text-small",
        className,
      )}
    >
      <TierIcon weight="fill" size={sm ? 14 : 18} aria-hidden="true" className={cn("shrink-0", faceText[tier])} />
      {meta.shortLabel}
    </span>
  );
}
