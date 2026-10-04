import type { Unit } from "@shared/types";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export interface PriceTextProps { amount: number; unit?: Unit; size?: "sm" | "md" | "lg" | "xl"; strike?: boolean; className?: string }

const sizeClass = { sm: "text-[16px]", md: "text-[22px]", lg: "text-[32px]", xl: "text-[56px] md:text-[64px]" } as const;
const unitClass = { sm: "text-micro", md: "text-small", lg: "text-body", xl: "text-body" } as const;

export function PriceText({ amount, unit, size = "md", strike, className }: PriceTextProps) {
  const text = formatMoney(amount);
  const hasSymbol = text.startsWith("$");
  const number = hasSymbol ? text.slice(1) : text;
  return (
    <span className={cn("inline-flex items-baseline gap-0.5 font-display font-bold tabular leading-none", sizeClass[size], strike ? "text-ink-soft" : "text-ink", className)}>
      <span className="sr-only">{text}{unit ? ` per ${unit}` : ""}</span>
      <span aria-hidden className="relative inline-block">
        <span className="inline-flex items-baseline">
          {hasSymbol && <span className="relative -top-[0.32em] mr-[0.03em] text-[0.6em]">$</span>}
          <span>{number}</span>
        </span>
        {strike && <span className="pointer-events-none absolute left-[-4%] top-1/2 h-[2px] w-[108%] -translate-y-1/2 -rotate-[14deg] rounded-full bg-ink-soft" />}
      </span>
      {unit && <span aria-hidden className={cn("ml-0.5 font-body font-bold text-ink-soft", unitClass[size])}>/{unit}</span>}
    </span>
  );
}
