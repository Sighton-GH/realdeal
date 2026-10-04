import { useQuery } from "@tanstack/react-query";
import { Crosshair, MapPin } from "@phosphor-icons/react";
import type { RetailerId, TileColour } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { api } from "@/api/client";
import { Button, PriceText, Section, Skeleton, VerdictBadge } from "@/components/ui";
import { formatDistance, formatMoney, formatUnitPrice } from "@/lib/format";
import { useUserLocation } from "@/lib/useUserLocation";
import { useAppStore } from "@/store/useAppStore";
import { displayedPrice } from "@/lib/priceDisplay";
import { cn } from "@/lib/cn";

export interface NearbyPricesProps {
  itemId: string;
  checkedPrice?: { retailerId: RetailerId; unitPrice: number };
  limit?: number;
  title?: string;
  className?: string;
}

const tileDotClass: Record<TileColour, string> = {
  tangerine: "bg-tangerine",
  pink: "bg-pink",
  teal: "bg-teal",
  violet: "bg-violet",
  berry: "bg-berry", forest: "bg-forest", indigo: "bg-indigo", slate: "bg-slate",
};

export function NearbyPrices({
  itemId,
  checkedPrice,
  limit = 6,
  title = "Prices near you",
  className,
}: NearbyPricesProps) {
  const mode = useAppStore((s) => s.priceDisplay);
  const { point, source, status, request } = useUserLocation();

  const queryLimit = limit ?? 6;
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["nearby", itemId, point.lat.toFixed(3), point.lng.toFixed(3), queryLimit],
    queryFn: () => api.getNearbyPrices(itemId, point, queryLimit),
  });

  const { data: itemDetail } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => api.getItem(itemId),
    staleTime: 60_000,
  });
  const unit = itemDetail?.item.unit;

  const action =
    source === "default" ? (
      <Button
        variant="ghost"
        size="md"
        leftIcon={<Crosshair size={18} weight="bold" />}
        onClick={request}
        loading={status === "locating"}
      >
        Use my location
      </Button>
    ) : undefined;

  let subheader = "Showing stores near SFU Burnaby.";
  if (source === "gps") {
    subheader = "Near your location";
  } else if (status === "denied") {
    subheader = "Location is off, so we're showing stores near SFU Burnaby.";
  } else if (status === "unavailable") {
    subheader = "Location isn't available here, so we're showing stores near SFU Burnaby.";
  }

  return (
    <Section title={title} action={action} className={className}>
      <p className="-mt-1 text-small text-ink-soft">{subheader}</p>

      {isPending && (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-[72px] w-full rounded-md" />
          <Skeleton className="h-[72px] w-full rounded-md" />
          <Skeleton className="h-[72px] w-full rounded-md" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-md bg-sunken p-3 text-small text-ink-soft">
          <span>Couldn't load nearby prices.</span>
          <Button variant="ghost" size="md" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {!isPending && !isError && (!data || data.length === 0) && (
        <p className="text-small text-ink-soft">No stores found near you.</p>
      )}

      {!isPending && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {data.map((n) => {
            const retailer = retailerById(n.store.retailerId);
            const isSameChain = checkedPrice && n.store.retailerId === checkedPrice.retailerId;

            let cheaperDiff: number | null = null;
            if (checkedPrice) {
              const pctCheaper = (checkedPrice.unitPrice - n.unitPrice) / checkedPrice.unitPrice;
              if (pctCheaper >= 0.03 && n.unitPrice > 0) {
                cheaperDiff = (checkedPrice.unitPrice - n.unitPrice) * (n.price / n.unitPrice);
              }
            }

            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${n.store.lat},${n.store.lng}`;

            return (
              <a
                key={n.store.id}
                href={mapsUrl}
                aria-label={`${n.store.name}, ${formatDistance(n.distanceKm)} away, ${formatMoney(n.price)}. Opens directions in a new tab.`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "lifted flex min-h-[72px] items-center justify-between gap-2 rounded-md p-3 text-left transition-colors hover:border-grape-400",
                  isSameChain ? "bg-grape-50" : "bg-canvas",
                )}
              >
                {/* Left */}
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-1.5 h-3 w-3 shrink-0 rounded-full",
                      tileDotClass[retailer.tile],
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 font-extrabold leading-tight text-ink">{n.store.name}</div>
                    <div className="flex items-baseline gap-2 text-small text-ink-soft">
                      <span className="shrink-0 font-bold">{formatDistance(n.distanceKm)}</span>
                      <span className="truncate">{n.store.address}</span>
                    </div>
                    {/* Pills */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {cheaperDiff !== null && (
                        <span className="inline-flex items-center rounded-full bg-steal-tint px-2 py-0.5 text-micro font-extrabold text-steal-lip">
                          {formatMoney(cheaperDiff)} cheaper
                        </span>
                      )}
                      {n.onSale && (
                        <span className="inline-flex items-center rounded-full bg-steal-tint px-2 py-0.5 text-micro font-extrabold text-steal-lip">
                          On sale
                        </span>
                      )}
                      {n.multiBuy && (
                        <span className="inline-flex items-center rounded-full bg-sunken px-2 py-0.5 text-micro font-extrabold text-ink">
                          {n.multiBuy.qty} for {formatMoney(n.multiBuy.total)}
                        </span>
                      )}
                      {n.live && (
                        <span className="inline-flex items-center rounded-full bg-sunken px-2 py-0.5 text-micro font-extrabold text-ink">
                          Live price
                        </span>
                      )}
                      {n.priceScope === "chain" && (
                        <span
                          title="We don't have this branch's own price, so this is the chain's usual price"
                          className="inline-flex cursor-help items-center rounded-full bg-sunken px-2 py-0.5 text-micro font-extrabold text-ink-soft"
                        >
                          Chain price
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: price, unit price and verdict stacked so the branch name keeps its room */}
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <PriceText {...(itemDetail ? displayedPrice(n.price, n.unitPrice, itemDetail.item, mode) : { amount: n.price })} size="md" />
                    {mode === "package" && <span className="text-small font-bold text-ink-soft">
                      {unit ? formatUnitPrice(n.unitPrice, unit) : formatMoney(n.unitPrice)}
                    </span>}
                    <VerdictBadge tier={n.tier} size="sm" />
                  </div>
                  <span className="text-ink-soft">
                    <MapPin size={22} weight="bold" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </Section>
  );
}