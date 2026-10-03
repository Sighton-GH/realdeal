// STUB (SPEC-00). UI-03 replaces; props are final.
import type { Unit } from "@shared/types";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export interface PriceTextProps { amount: number; unit?: Unit; size?: "sm" | "md" | "lg" | "xl"; strike?: boolean; className?: string }

const sizeClass = { sm: "text-[16px]", md: "text-[22px]", lg: "text-[32px]", xl: "text-[56px] md:text-[64px]" } as const;

export function PriceText({ amount, unit, size = "md", strike, className }: PriceTextProps) {
  return (
    <span className={cn("font-display font-bold tabular leading-none", sizeClass[size], strike && "text-ink-soft line-through", className)}>
      {formatMoney(amount)}
      {unit && <span className="ml-0.5 font-body text-small font-bold text-ink-soft">/{unit}</span>}
    </span>
  );
}
