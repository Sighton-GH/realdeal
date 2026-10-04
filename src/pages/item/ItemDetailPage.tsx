import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { ItemDetail, RetailerId, TileColour } from "@shared/types";
import { RETAILERS, retailerById } from "@shared/retailers";
import { tierFor } from "@shared/verdict";
import { api } from "@/api/client";
import { ItemArt } from "@/components/art";
import { DataFreshness, NearbyPrices, PriceHistoryChart, SaleStreak } from "@/components/domain";
import { useTopBar } from "@/components/layout";
import { PennyFace } from "@/components/penny";
import { Button, Card, Chip, EmptyState, LinkButton, PriceText, Section, Skeleton, VerdictBadge } from "@/components/ui";
import { formatMoney, formatUnitPrice } from "@/lib/format";
import { getDefaultSizeForItem, getSizesForItem, type ItemSizeOption } from "@/lib/itemSizes";
import { useRunCheck } from "@/pages/check/useRunCheck";
import { checkInput, currentOffer, historyFor, unitLabel } from "./itemDetailModel";

import { useAppStore } from "@/store/useAppStore";
import { displayedPrice } from "@/lib/priceDisplay";

const dotClass: Record<TileColour, string> = {
  tangerine: "bg-tangerine", pink: "bg-pink", teal: "bg-teal", violet: "bg-violet",
  berry: "bg-berry", forest: "bg-forest", indigo: "bg-indigo", slate: "bg-slate",
};

function StoreDot({ tile }: { tile: TileColour }) {
  return <span aria-hidden="true" className={`inline-block size-3 shrink-0 rounded-full ${dotClass[tile]}`} />;
}

function ItemLoading() {
  return (
    <div role="status" aria-label="Loading item" className="flex flex-col gap-7 px-5 py-6">
      <div aria-hidden="true" className="flex items-center gap-4">
        <Skeleton className="size-[72px] shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-20" /></div>
      </div>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-[240px] w-full" />
      {[0, 1, 2, 3].map((row) => <Skeleton key={row} className="h-28 w-full" />)}
    </div>
  );
}

function ItemEvidence({ detail }: { detail: ItemDetail }) {
  const { item, stats } = detail;
  const mode = useAppStore((s) => s.priceDisplay);
  const setMode = useAppStore((s) => s.setPriceDisplay);
  const availableSizes = getSizesForItem(item);
  const [selectedSize, setSelectedSize] = useState<ItemSizeOption>(() => getDefaultSizeForItem(item));
  const [focusRetailer, setFocusRetailer] = useState<RetailerId>();
  const { run, running, error } = useRunCheck();
  const offers = stats.byRetailer.map((store) => currentOffer(detail, store))
    .sort((a, b) => a.unitPrice - b.unitPrice);
  const saleHistories = RETAILERS.map((retailer) => {
    const history = historyFor(detail, retailer.id);
    return { retailer, history, saleWeeks: history.slice(-12).filter((point) => point.onSale).length };
  }).filter(({ history }) => history.length > 0);

  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <header className="flex items-center gap-4">
        <ItemArt artKey={item.artKey} size={72} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display text-h1 font-bold">{item.name}</h1>
          <p className="mt-1 text-small font-bold text-ink-soft">Standard size: {item.sizeLabel}</p>
          <p className="text-small font-bold capitalize text-ink-soft">{item.category}</p>
        </div>
      </header>

      {/* Package Size Selector */}
      <div className="flex flex-col gap-2 rounded-md border-2 border-line bg-canvas p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-small font-extrabold text-ink">
            Package size
          </span>
          <span className="text-small font-bold text-ink-soft">
            {selectedSize.description ?? selectedSize.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {availableSizes.map((s) => (
            <Chip
              key={s.label}
              selected={selectedSize.label === s.label && Math.abs(selectedSize.sizeQty - s.sizeQty) < 0.001}
              onClick={() => setSelectedSize(s)}
              className="min-h-11"
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <LinkButton
        to={`/check/${item.id}?size=${selectedSize.sizeQty}&sizeLabel=${encodeURIComponent(selectedSize.label)}`}
        fullWidth
      >
        Check a price for {selectedSize.label}
      </LinkButton>

      <section aria-label="Usual price" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-extrabold">Usual price</span>
          <PriceText {...displayedPrice(stats.avgUnit90 * item.sizeQty, stats.avgUnit90, item, mode)} size="lg" />
          {mode === "package" && item.sizeLabel !== "per kg" && <span className="text-small font-bold text-ink-soft">{formatUnitPrice(stats.avgUnit90, item.unit)}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card tone="sunken"><p className="mb-1 text-small font-bold text-ink-soft">90-day low</p><PriceText {...displayedPrice(stats.lowUnit90 * item.sizeQty, stats.lowUnit90, item, mode)} size="md" /></Card>
          <Card tone="sunken"><p className="mb-1 text-small font-bold text-ink-soft">90-day high</p><PriceText {...displayedPrice(stats.highUnit90 * item.sizeQty, stats.highUnit90, item, mode)} size="md" /></Card>
        </div>
      </section>
      {mode === "package" && item.sizeLabel !== "per kg" && <p className="-mt-4 text-small font-bold text-ink-soft">Usual price and 90-day range are for a {item.sizeLabel} package. History shows each week's actual package price.</p>}
      <Section title="Price history">
        <div role="group" aria-label="Price history units" className="flex flex-wrap gap-2">
          <Chip selected={mode === "unit"} onClick={() => setMode("unit")} className="min-h-12">{unitLabel[item.unit]}</Chip>
          <Chip selected={mode === "package"} onClick={() => setMode("package")} className="min-h-12">Package</Chip>
        </div>
        <PriceHistoryChart detail={detail} mode={mode} focusRetailer={focusRetailer} />
        <div role="group" aria-label="Focus a store in the chart" className="grid grid-cols-2 gap-2">
          {RETAILERS.map((retailer) => (
            <Chip key={retailer.id} selected={focusRetailer === retailer.id}
              icon={<StoreDot tile={retailer.tile} />} className="min-h-12 justify-center px-3"
              onClick={() => setFocusRetailer((current) => current === retailer.id ? undefined : retailer.id)}>
              {retailer.shortName}
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="Right now">
        {offers.length === 0 ? <p className="text-small text-ink-soft">No current prices for this item.</p> : (
          <div className="flex flex-col gap-3" aria-busy={running}>
            {offers.map(({ stats: store, offer, unitPrice }) => {
              const retailer = retailerById(store.retailerId);
              const shelfPrice = Math.round(store.currentUnitPrice * selectedSize.sizeQty * 100) / 100;
              return (
                <Button key={store.retailerId} variant="secondary" fullWidth disabled={running}
                  className="h-auto min-h-12 px-4 py-4 font-body normal-case tracking-normal [&>span]:w-full"
                  aria-label={`Check ${retailer.name} price, ${formatMoney(shelfPrice)}, ${formatUnitPrice(unitPrice, item.unit)}`}
                  onClick={() => {
                    void run({
                      ...checkInput(detail, store),
                      sizeQty: selectedSize.sizeQty,
                      price: shelfPrice,
                    });
                  }}>
                  <span className="flex w-full flex-col gap-2 text-left text-ink">
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 pt-1 font-extrabold"><StoreDot tile={retailer.tile} />{retailer.name}</span>
                      <span className="flex shrink-0 flex-col items-end"><PriceText {...displayedPrice(store.currentPrice, unitPrice, item, mode)} size="md" />{mode === "package" && <span className="text-small font-bold text-ink-soft">{formatUnitPrice(unitPrice, item.unit)}</span>}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <VerdictBadge tier={tierFor((unitPrice - stats.avgUnit90) / stats.avgUnit90)} size="sm" />
                      {store.onSale && <span className="rounded-full bg-sunken px-2 py-1 text-micro font-extrabold">On sale</span>}
                      {store.live && <span className="rounded-full bg-sunken px-2 py-1 text-micro font-extrabold">Live price</span>}
                    </span>
                    {offer?.multiBuy && <span className="text-small font-bold text-ink-soft">{offer.multiBuy.qty} for {formatMoney(offer.multiBuy.total)}</span>}
                    <span className="text-small font-bold text-ink-soft">Package size: {selectedSize.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        )}
        {running && <p role="status" className="text-small text-ink-soft">Checking that price...</p>}
        {error && <p role="alert" className="text-small text-ink-soft">Couldn't check that price. Try the store again.</p>}
      </Section>
      <NearbyPrices itemId={item.id} limit={6} />
      <Section title="How often it's on sale">
        {saleHistories.length === 0 && <p className="text-small text-ink-soft">No sale history yet.</p>}
        <div className="flex flex-col gap-4">
          {saleHistories.map(({ retailer, history, saleWeeks }) => (
            <div key={retailer.id} className="flex flex-col gap-2">
              <p className="flex items-center gap-2 font-extrabold"><StoreDot tile={retailer.tile} />{retailer.name}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SaleStreak points={history} weeks={12} />
                <span className="text-small font-bold text-ink-soft">{saleWeeks} of 12 weeks</span>
              </div>
            </div>
          ))}
        </div>
        {saleHistories.filter(({ saleWeeks }) => saleWeeks >= 6).map(({ retailer }) => (
          <Card key={retailer.id} tone="sunken" className="flex items-start gap-3">
            <PennyFace mood="suspicious" size={40} className="shrink-0" />
            <p className="text-small font-bold">{retailer.name} runs this 'sale' most weeks. Treat the sale price as the real price.</p>
          </Card>
        ))}
      </Section>
      <DataFreshness />
    </div>
  );
}

export function ItemDetailPage() {
  const { itemId = "" } = useParams();
  useTopBar({ back: true });
  const query = useQuery({ queryKey: ["item", itemId], queryFn: () => api.getItem(itemId) });
  if (query.isPending) return <ItemLoading />;
  if (query.isError) {
    const notFound = query.error instanceof Error && query.error.message === "Item not found";
    return (
      <div className="px-5 py-6">
        {notFound ? <EmptyState mood="sad" title="Penny can't find that item." action={<LinkButton to="/check">Back to search</LinkButton>} /> :
          <EmptyState mood="sad" title="Couldn't load this item" body="Check your connection and try again." action={<Button onClick={() => { void query.refetch(); }}>Try again</Button>} />}
      </div>
    );
  }
  return <ItemEvidence key={itemId} detail={query.data} />;
}
