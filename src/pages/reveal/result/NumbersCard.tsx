import type { Verdict } from "@shared/types";
import { PriceGauge } from "@/components/domain";
import { Card, PriceText } from "@/components/ui";
import { formatMoney, formatUnitPrice } from "@/lib/format";

/** Section 2 and 3: the numbers card, the 90-day range, and the savings line. */
export function NumbersCard({ verdict }: { verdict: Verdict }) {
  const { item, unitPrice, avgUnitPrice, pctVsAvg, tier, low90, high90, savingsVsAvg } = verdict;
  return (
    <>
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-small text-ink-soft">You'd pay</span>
            <PriceText size="lg" amount={unitPrice} unit={item.unit} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-small text-ink-soft">Usual price</span>
            <PriceText size="lg" amount={avgUnitPrice} unit={item.unit} className="text-ink-soft" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <PriceGauge pctVsAvg={pctVsAvg} tier={tier} animate />
          <p className="text-small text-ink-soft">
            90-day range {formatUnitPrice(low90, item.unit)} to {formatUnitPrice(high90, item.unit)}
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
