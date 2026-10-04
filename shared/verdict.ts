// Verdict engine (DATA-03). Pure TypeScript, shared by the browser (mock mode) and the server (live mode).
import type {
  Category, GeoPoint, Item, ItemDetail, NearbyStorePrice, PriceCheckInput, PricePoint,
  PriceStore, RetailerId, RetailerStats, Verdict,
} from "./types";
import { RETAILERS, retailerById } from "./retailers";
import { detectTricks } from "./engine/tricks";
import { distanceKm, mean, newCheckId, tierFor, unitPriceOf } from "./engine/util";

export { DATA_END, WEEKS } from "./seed/constants";
export { generateSeedStore } from "./seed/generate";
export { unitPriceOf, tierFor, distanceKm };

const WINDOW_WEEKS = 13; // about 90 days

export function mergeStores(base: PriceStore, overlays: PricePoint[][]): PriceStore {
  const key = (p: PricePoint) => `${p.itemId}|${p.retailerId}|${p.date}|${p.storeId ?? "chain"}`;
  const map = new Map(base.points.map((p) => [key(p), p]));
  for (const layer of overlays) for (const p of layer) map.set(key(p), p);
  return { items: base.items, locations: base.locations, points: [...map.values()], generatedAt: new Date().toISOString() };
}

/** Chain-level points only (no storeId), oldest first. */
function chainPoints(store: PriceStore, itemId: string): PricePoint[] {
  return store.points
    .filter((p) => p.itemId === itemId && !p.storeId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

const forRetailer = (pts: PricePoint[], id: RetailerId) => pts.filter((p) => p.retailerId === id);

export function getItemDetail(store: PriceStore, itemId: string): ItemDetail {
  const item = store.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  const history = chainPoints(store, itemId);
  if (history.length === 0) throw new Error("No price data for item");

  const units: number[] = [];
  const byRetailer: RetailerStats[] = [];
  for (const r of RETAILERS) {
    const pts = forRetailer(history, r.id);
    if (pts.length === 0) continue;
    for (const p of pts.slice(-WINDOW_WEEKS)) units.push(unitPriceOf(p.price, p.sizeQty, p.multiBuy));
    const last = pts[pts.length - 1];
    byRetailer.push({
      retailerId: r.id,
      currentPrice: last.price,
      currentUnitPrice: unitPriceOf(last.price, last.sizeQty, last.multiBuy),
      onSale: last.onSale,
      saleFreq12w: pts.slice(-12).filter((p) => p.onSale).length / 12,
      currentSizeQty: last.sizeQty,
      lastSeen: last.date,
      live: last.source === "scrape",
    });
  }
  return {
    item,
    history,
    stats: { avgUnit90: mean(units), lowUnit90: Math.min(...units), highUnit90: Math.max(...units), byRetailer },
  };
}

export function checkPrice(store: PriceStore, input: PriceCheckInput, now: Date = new Date()): Verdict {
  const detail = getItemDetail(store, input.itemId);
  const { item, stats } = detail;
  const rid = input.retailerId;
  const mineHistory = rid ? forRetailer(detail.history, rid) : [];
  const mine = rid ? stats.byRetailer.find((r) => r.retailerId === rid) : undefined;

  const size = input.sizeQty ?? mine?.currentSizeQty ?? item.sizeQty;
  const unitPrice = unitPriceOf(input.price, size, input.multiBuy);
  const avg = stats.avgUnit90;
  const pct = (unitPrice - avg) / avg;
  const saleFreq12w = mine?.saleFreq12w ?? 0;

  // Cheapest current price: every retailer's latest point, with the input store at the input price.
  const candidates: Verdict["best"][] = stats.byRetailer
    .filter((r) => r.retailerId !== rid)
    .map((r) => ({ retailerId: r.retailerId, price: r.currentPrice, unitPrice: r.currentUnitPrice }));
  candidates.push({ retailerId: rid, price: input.price, unitPrice });
  const best = candidates.reduce((a, b) => (b.unitPrice < a.unitPrice ? b : a));

  return {
    checkId: newCheckId(),
    createdAt: now.toISOString(),
    input,
    item,
    tier: tierFor(pct),
    unitPrice,
    avgUnitPrice: avg,
    pctVsAvg: pct,
    savingsVsAvg: (avg - unitPrice) * size,
    low90: stats.lowUnit90,
    high90: stats.highUnit90,
    saleFreq12w,
    best,
    tricks: detectTricks({
      item, input, retailer: rid ? retailerById(rid) : undefined, history: mineHistory,
      size, inputUnit: unitPrice, pctVsAvg: pct, saleFreq12w,
    }),
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
  const avg = detail.stats.avgUnit90;
  const itemPoints = store.points.filter((p) => p.itemId === itemId);
  const latestWeek = itemPoints.reduce((m, p) => (p.date > m ? p.date : m), "");

  const out: NearbyStorePrice[] = [];
  const nearest = store.locations
    .map((loc) => ({ loc, d: distanceKm(near, loc) }))
    .sort((a, b) => a.d - b.d);
  for (const { loc, d } of nearest) {
    if (out.length >= limit) break;
    const branch = itemPoints.find((p) => p.storeId === loc.id && p.date === latestWeek);
    const chain = forRetailer(detail.history, loc.retailerId).slice(-1)[0];
    const p = branch ?? chain;
    if (!p) continue; // retailer has no data for this item
    const unit = unitPriceOf(p.price, p.sizeQty, p.multiBuy);
    out.push({
      store: loc,
      distanceKm: d,
      price: p.price,
      unitPrice: unit,
      onSale: p.onSale,
      multiBuy: p.multiBuy,
      tier: tierFor((unit - avg) / avg),
      priceScope: branch ? "store" : "chain",
      live: p.source === "scrape",
      date: p.date,
    });
  }
  return out;
}
