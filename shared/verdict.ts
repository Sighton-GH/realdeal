// PLACEHOLDER engine (SPEC-00). DATA-03 replaces the bodies; keep every export name and signature.
import type {
  Category, GeoPoint, Item, ItemDetail, MultiBuy, NearbyStorePrice, PriceCheckInput, PricePoint,
  PriceStore, RetailerStats, Verdict, VerdictTier,
} from "./types";
import { RETAILERS } from "./retailers";

export { DATA_END, WEEKS } from "./seed/constants";
export { generateSeedStore } from "./seed/generate";

export function unitPriceOf(price: number, sizeQty: number, multiBuy?: MultiBuy): number {
  const effective = multiBuy ? multiBuy.total / multiBuy.qty : price;
  return effective / sizeQty;
}

export function tierFor(pct: number): VerdictTier {
  if (pct <= -0.25) return "steal";
  if (pct <= -0.1) return "good";
  if (pct <= 0.1) return "normal";
  return "high";
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function mergeStores(base: PriceStore, overlays: PricePoint[][]): PriceStore {
  const key = (p: PricePoint) => `${p.itemId}|${p.retailerId}|${p.date}|${p.storeId ?? "chain"}`;
  const map = new Map(base.points.map((p) => [key(p), p]));
  for (const layer of overlays) for (const p of layer) map.set(key(p), p);
  return { ...base, points: [...map.values()], generatedAt: new Date().toISOString() };
}

function chainPoints(store: PriceStore, itemId: string): PricePoint[] {
  return store.points.filter((p) => p.itemId === itemId && !p.storeId).sort((a, b) => a.date.localeCompare(b.date));
}

export function getItemDetail(store: PriceStore, itemId: string): ItemDetail {
  const item = store.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  const history = chainPoints(store, itemId);
  const units: number[] = [];
  const byRetailer: RetailerStats[] = RETAILERS.map((r) => {
    const pts = history.filter((p) => p.retailerId === r.id);
    pts.slice(-13).forEach((p) => units.push(unitPriceOf(p.price, p.sizeQty, p.multiBuy)));
    const last = pts[pts.length - 1];
    const last12 = pts.slice(-12);
    return {
      retailerId: r.id,
      currentPrice: last.price,
      currentUnitPrice: unitPriceOf(last.price, last.sizeQty, last.multiBuy),
      onSale: last.onSale,
      saleFreq12w: last12.filter((p) => p.onSale).length / 12,
      currentSizeQty: last.sizeQty,
      lastSeen: last.date,
      live: last.source === "scrape",
    };
  });
  const avg = units.reduce((a, b) => a + b, 0) / units.length;
  return { item, history, stats: { avgUnit90: avg, lowUnit90: Math.min(...units), highUnit90: Math.max(...units), byRetailer } };
}

export function checkPrice(store: PriceStore, input: PriceCheckInput, now: Date = new Date()): Verdict {
  const detail = getItemDetail(store, input.itemId);
  const size = input.sizeQty ?? detail.item.sizeQty;
  const unitPrice = unitPriceOf(input.price, size, input.multiBuy);
  const avg = detail.stats.avgUnit90;
  const pct = (unitPrice - avg) / avg;
  const bestStats = [...detail.stats.byRetailer].sort((a, b) => a.currentUnitPrice - b.currentUnitPrice)[0];
  const best = bestStats.currentUnitPrice < unitPrice
    ? { retailerId: bestStats.retailerId, price: bestStats.currentPrice, unitPrice: bestStats.currentUnitPrice }
    : { retailerId: input.retailerId, price: input.price, unitPrice };
  const mine = detail.stats.byRetailer.find((r) => r.retailerId === input.retailerId);
  return {
    checkId: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8),
    createdAt: now.toISOString(),
    input,
    item: detail.item,
    tier: tierFor(pct),
    unitPrice,
    avgUnitPrice: avg,
    pctVsAvg: pct,
    savingsVsAvg: (avg - unitPrice) * size,
    low90: detail.stats.lowUnit90,
    high90: detail.stats.highUnit90,
    saleFreq12w: mine?.saleFreq12w ?? 0,
    best,
    tricks: [],
    dataPoints: detail.history.length,
  };
}

export function searchItems(store: PriceStore, q: string, category?: Category): Item[] {
  const needle = q.trim().toLowerCase();
  return store.items
    .filter((i) => !category || i.category === category)
    .filter((i) => !needle || [i.name, i.brand ?? "", ...i.aliases].some((s) => s.toLowerCase().includes(needle)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getNearbyPrices(store: PriceStore, itemId: string, near: GeoPoint, limit = 8): NearbyStorePrice[] {
  const detail = getItemDetail(store, itemId);
  return store.locations
    .map((loc) => ({ loc, d: distanceKm(near, loc) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ loc, d }) => {
      const branch = store.points.filter((p) => p.itemId === itemId && p.storeId === loc.id).sort((a, b) => b.date.localeCompare(a.date))[0];
      const chain = detail.history.filter((p) => p.retailerId === loc.retailerId).slice(-1)[0];
      const p = branch ?? chain;
      const unit = unitPriceOf(p.price, p.sizeQty, p.multiBuy);
      return {
        store: loc, distanceKm: d, price: p.price, unitPrice: unit, onSale: p.onSale, multiBuy: p.multiBuy,
        tier: tierFor((unit - detail.stats.avgUnit90) / detail.stats.avgUnit90),
        priceScope: branch ? "store" : "chain", live: p.source === "scrape", date: p.date,
      };
    });
}
