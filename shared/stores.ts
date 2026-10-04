import { RETAILERS } from "./retailers";
import type { PricePoint, PriceStore, RetailerId, StoreItemRow, StoreSummary } from "./types";
import { unitPriceOf } from "./engine/util";

/** Latest chain-level point per item for one retailer. */
function latestByItem(store: PriceStore, retailerId: RetailerId): Map<string, PricePoint> {
  const latest = new Map<string, PricePoint>();
  for (const p of store.points) {
    if (p.retailerId !== retailerId || p.storeId) continue;
    const prev = latest.get(p.itemId);
    if (!prev || p.date >= prev.date) latest.set(p.itemId, p);
  }
  return latest;
}

export function getStoreSummaries(store: PriceStore): StoreSummary[] {
  return RETAILERS.map((r) => {
    const latest = latestByItem(store, r.id);
    const weeks = new Map<string, Set<string>>();
    const sources = new Set<StoreSummary["sources"][number]>();
    for (const p of store.points) {
      if (p.retailerId !== r.id || p.storeId) continue;
      sources.add(p.source);
      (weeks.get(p.itemId) ?? weeks.set(p.itemId, new Set()).get(p.itemId)!).add(p.date);
    }
    const rows = [...latest.values()];
    return {
      retailerId: r.id,
      itemCount: rows.length,
      realItemCount: rows.filter((p) => p.source !== "seed").length,
      weeksOfData: Math.max(0, ...[...weeks.values()].map((w) => w.size)),
      latestDate: rows.reduce((m, p) => (p.date > m ? p.date : m), ""),
      sources: [...sources],
    };
  });
}

export function getStoreItems(store: PriceStore, retailerId: RetailerId): StoreItemRow[] {
  const items = new Map(store.items.map((i) => [i.id, i]));
  const rows: StoreItemRow[] = [];
  for (const [itemId, p] of latestByItem(store, retailerId)) {
    const item = items.get(itemId);
    if (!item) continue;
    rows.push({
      item,
      price: p.price,
      regularPrice: p.regularPrice,
      onSale: p.onSale,
      unitPrice: unitPriceOf(p.price, p.sizeQty, p.multiBuy),
      date: p.date,
      source: p.source,
    });
  }
  return rows.sort((a, b) => a.item.category.localeCompare(b.item.category) || a.item.name.localeCompare(b.item.name));
}
