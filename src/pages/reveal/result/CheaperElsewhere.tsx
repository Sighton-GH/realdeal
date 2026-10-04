import type { RetailerId, Verdict } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { formatMoney, formatUnitPrice } from "@/lib/format";

const dotClass: Record<ReturnType<typeof retailerById>["tile"], string> = {
  tangerine: "bg-tangerine",
  pink: "bg-pink",
  teal: "bg-teal",
  violet: "bg-violet",
  berry: "bg-berry", forest: "bg-forest", indigo: "bg-indigo", slate: "bg-slate",
};

/** True when another store is at least 3% cheaper per unit than the checked price. */
export function hasCheaperElsewhere(verdict: Verdict): boolean {
  const { best, input, unitPrice } = verdict;
  return best.retailerId !== input.retailerId && best.unitPrice <= unitPrice * 0.97;
}

export function CheaperElsewhere({ verdict }: { verdict: Verdict }) {
  const mode = useAppStore((s) => s.priceDisplay);
  const id: RetailerId = verdict.best.retailerId;
  const retailer = retailerById(id);
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full", dotClass[retailer.tile])} />
        <p className="text-h3 font-extrabold">
          {retailer.name} has it for {mode === "unit" ? formatUnitPrice(verdict.best.unitPrice, verdict.item.unit) : formatMoney(verdict.best.price)} right now.
        </p>
      </div>
    </Card>
  );
}
