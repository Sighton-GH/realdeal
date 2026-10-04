import type { Verdict } from "@shared/types";
import { formatTagAmount } from "@shared/units";
import { PriceGauge } from "@/components/domain";
import { Card, PriceText } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { displayedPrice } from "@/lib/priceDisplay";
import { formatMoney, formatUnitPrice } from "@/lib/format";

/** Section 2 and 3: the numbers card, the 90-day range, and the savings line. */
export function NumbersCard({ verdict }: { verdict: Verdict }) {
  const mode = useAppStore((s) => s.priceDisplay);
  const size = verdict.input.sizeQty ?? verdict.item.sizeQty;
  const { item, unitPrice, avgUnitPrice, pctVsAvg, tier, low90, high90, savingsVsAvg } = verdict;
  const tag = verdict.input.tagAmount;
  if (tag) {
    const label = formatTagAmount(tag);
    return (
      <>
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-small text-ink-soft">You'd pay</span>
              <PriceText size="lg" amount={unitPrice * size} />
              <span className="text-small font-bold text-ink-soft">{label}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-small text-ink-soft">Usual price</span>
              <PriceText size="lg" amount={avgUnitPrice * size} className="text-ink-soft" />
              <span className="text-small font-bold text-ink-soft">{label}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <PriceGauge pctVsAvg={pctVsAvg} tier={tier} animate />
            <p className="text-small text-ink-soft">
              90-day range {formatMoney(low90 * size)} to {formatMoney(high90 * size)} {label}
            </p>
          </div>
        </Card>
        <h3 className="font-body text-h3 font-extrabold">{savingsLine(savingsVsAvg)}</h3>
      </>
    );
  }
  return (
    <>
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-small text-ink-soft">You'd pay</span>
            <PriceText size="lg" {...displayedPrice(unitPrice * size, unitPrice, item, mode)} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-small text-ink-soft">Usual price</span>
            <PriceText size="lg" {...displayedPrice(avgUnitPrice * size, avgUnitPrice, item, mode)} className="text-ink-soft" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <PriceGauge pctVsAvg={pctVsAvg} tier={tier} animate />
          <p className="text-small text-ink-soft">
            90-day range {mode === "unit" || item.sizeLabel === "per kg" ? `${formatUnitPrice(low90, item.unit)} to ${formatUnitPrice(high90, item.unit)}` : `${formatMoney(low90 * size)} to ${formatMoney(high90 * size)} for this package size`}
            {mode === "package" && item.sizeLabel !== "per kg" && <span className="block">Comparison for {verdict.input.sizeQty ? "your entered" : item.sizeLabel} package size.</span>}
          </p>
        </div>
      </Card>
      <h3 className="font-body text-h3 font-extrabold">{savingsLine(savingsVsAvg)}</h3>
    </>
  );
}

export function savingsLine(savingsVsAvg: number): string {
  if (savingsVsAvg > 0.005) return `You save ${formatMoney(Math.abs(savingsVsAvg))} vs the usual price.`;
  if (savingsVsAvg < -0.005) return `You'd pay ${formatMoney(Math.abs(savingsVsAvg))} more than usual.`;
  return "Right at the usual price.";
}
