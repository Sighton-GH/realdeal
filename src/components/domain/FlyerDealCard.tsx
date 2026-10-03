// STUB (SPEC-00). SCR-04 replaces; props are final.
import type { FeaturedDeal } from "@shared/types";
import { Button } from "@/components/ui";
import { formatMoney } from "@/lib/format";

export interface FlyerDealCardProps { deal: FeaturedDeal; onCheck: (deal: FeaturedDeal) => void; loading?: boolean; className?: string }

export function FlyerDealCard({ deal, onCheck, loading, className }: FlyerDealCardProps) {
  return (
    <div className={`lifted flex w-[220px] shrink-0 flex-col gap-3 rounded-md bg-canvas p-4 ${className ?? ""}`}>
      <div className="rounded-sm bg-normal p-3 font-display text-[32px] font-bold">
        {deal.multiBuy ? `${deal.multiBuy.qty} for ${formatMoney(deal.multiBuy.total)}` : formatMoney(deal.price)}
      </div>
      <div className="font-extrabold">{deal.item.name}</div>
      <p className="text-small text-ink-soft">{deal.tagline}</p>
      <Button size="md" fullWidth loading={loading} onClick={() => onCheck(deal)}>Check it</Button>
    </div>
  );
}
