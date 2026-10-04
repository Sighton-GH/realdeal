import type { ItemDetail, PriceCheckInput, PricePoint, RetailerId, RetailerStats, Unit } from "@shared/types";
import { unitPriceOf } from "@shared/verdict";

export const unitLabel: Record<Unit, string> = {
  kg: "Per kg", L: "Per L", each: "Each", dozen: "Per dozen",
};

/** Chain-level history only, with one observation per week, oldest first. */
export function historyFor(detail: ItemDetail, retailerId: RetailerId): PricePoint[] {
  const weeks = new Map<string, PricePoint>();
  for (const point of detail.history) {
    if (point.retailerId === retailerId && !point.storeId) weeks.set(point.date, point);
  }
  return [...weeks.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function currentOffer(detail: ItemDetail, stats: RetailerStats) {
  const history = historyFor(detail, stats.retailerId);
  const latest = history.at(-1);
  // Stats carry the current package size; use the matching week's offer mechanics.
  const offer = latest?.date === stats.lastSeen ? latest : undefined;
  const unitPrice = unitPriceOf(stats.currentPrice, stats.currentSizeQty, offer?.multiBuy);
  return { stats, history, offer, unitPrice };
}

export function checkInput(detail: ItemDetail, stats: RetailerStats): PriceCheckInput {
  const { offer } = currentOffer(detail, stats);
  return {
    itemId: detail.item.id,
    retailerId: stats.retailerId,
    price: stats.currentPrice,
    sizeQty: stats.currentSizeQty,
    source: "flyer",
    ...(offer?.multiBuy ? { multiBuy: offer.multiBuy } : {}),
    ...(offer?.wasPrice !== undefined ? { wasPrice: offer.wasPrice } : {}),
  };
}
