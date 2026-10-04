import type { FeaturedDeal, TileColour } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { ItemArt } from "@/components/art";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export interface FlyerDealCardProps { deal: FeaturedDeal; onCheck: (deal: FeaturedDeal) => void; loading?: boolean; className?: string }

// Keep complete class names visible to Tailwind's scanner.
const storeDot: Record<TileColour, string> = {
  tangerine: "bg-tangerine", pink: "bg-pink", teal: "bg-teal", violet: "bg-violet",
};

export function FlyerDealCard({ deal, onCheck, loading, className }: FlyerDealCardProps) {
  const retailer = retailerById(deal.retailerId);
  const amount = formatMoney(deal.multiBuy ? deal.multiBuy.total : deal.price);
  const [dollars, cents] = amount.split(".");
  const priceLabel = deal.multiBuy ? `${deal.multiBuy.qty} for ${amount}` : amount;


  return (
    <article className={cn("lifted flex w-[220px] shrink-0 flex-col gap-3 rounded-md bg-canvas p-4 text-ink", className)}>
      <div className="-rotate-2 rounded-sm border-b-[3px] border-normal-lip bg-normal p-3">
        <div className="flex flex-wrap items-baseline gap-x-1.5 font-display tabular text-[32px] leading-tight font-bold" aria-label={priceLabel}>
          {deal.multiBuy && <span aria-hidden="true" className="text-h3">{deal.multiBuy.qty} for</span>}
          <span aria-hidden="true" className="whitespace-nowrap">
            {dollars}<sup className="relative -top-2 ml-0.5 text-h3 leading-none">.{cents}</sup>
          </span>
        </div>
        {deal.wasPrice != null && <div className="mt-1 flex items-center justify-between gap-2">
          <span className="relative text-small font-bold">
            was {formatMoney(deal.wasPrice)}
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -rotate-6 bg-ink" />
          </span>
          <span className="rounded-sm bg-canvas px-2 py-0.5 text-micro font-extrabold">SALE</span>
        </div>}
      </div>
      <div className="flex items-start gap-2">
        <ItemArt artKey={deal.item.artKey} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="font-body text-body leading-snug font-extrabold [overflow-wrap:anywhere]">{deal.item.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-small font-bold text-ink-soft">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", storeDot[retailer.tile])} />
            {retailer.shortName}
          </p>
        </div>
      </div>
      <p className="text-small font-bold text-ink-soft">{deal.tagline}</p>
      <Button size="md" fullWidth loading={loading} className="mt-auto" onClick={() => onCheck(deal)}>Check it</Button>
    </article>
  );
}
