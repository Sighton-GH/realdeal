import type { ItemDetail, PricePoint, RetailerId } from "@shared/types";

export type ChartMode = "unit" | "package";

/** Package price actually paid for one unit of the deal: split multi-buys. */
export function effectivePackagePrice(p: PricePoint): number {
  if (p.multiBuy) return p.multiBuy.total / p.multiBuy.qty;
  return p.price;
}

/**
 * Plotted value for one weekly point.
 * - "package": effective shelf price for one package.
 * - "unit": effective price divided by THAT WEEK's sizeQty, so a
 *   shrink (e.g. yogurt 650g -> 500g) shows as a visible jump.
 */
export function pointValue(p: PricePoint, mode: ChartMode): number {
  const pkg = effectivePackagePrice(p);
  if (mode === "package") return pkg;
  const size = p.sizeQty > 0 ? p.sizeQty : 1;
  return pkg / size;
}

/** Chain-level points only; branch overrides (storeId) are ignored. Sorted oldest first. */
export function chainPoints(detail: ItemDetail): PricePoint[] {
  return detail.history
    .filter((p) => !p.storeId)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function uniqueDates(points: PricePoint[]): string[] {
  const seen = new Set<string>();
  for (const p of points) seen.add(p.date);
  return [...seen].sort();
}

export function averageValue(detail: ItemDetail, mode: ChartMode): number {
  if (mode === "package") return detail.stats.avgUnit90 * detail.item.sizeQty;
  return detail.stats.avgUnit90;
}

export interface RetailerSeries {
  retailerId: RetailerId;
  points: PricePoint[];
}

export function seriesByRetailer(points: PricePoint[]): RetailerSeries[] {
  const map = new Map<RetailerId, PricePoint[]>();
  for (const p of points) {
    const arr = map.get(p.retailerId);
    if (arr) arr.push(p);
    else map.set(p.retailerId, [p]);
  }
  return [...map.entries()].map(([retailerId, pts]) => ({
    retailerId,
    points: pts.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
  }));
}

export function parseWeekDate(iso: string): Date {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

export function monthShort(date: Date): string {
  return date.toLocaleDateString("en-CA", { month: "short", timeZone: "UTC" });
}
