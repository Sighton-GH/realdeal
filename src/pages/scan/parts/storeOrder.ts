import type { NearbyStorePrice, Retailer, StoreLocation } from "@shared/types";

export const AT_STORE_KM = 0.3;

/** The user's stores, nearest chain first; atStore is the branch they are standing in, if any. */
export function orderRetailers(mine: Retailer[], nearby: NearbyStorePrice[]): { ordered: Retailer[]; atStore?: StoreLocation } {
  const allowed = new Set(mine.map((r) => r.id));
  const seen: Retailer[] = [];
  for (const n of nearby) {
    const r = mine.find((m) => m.id === n.store.retailerId);
    if (r && !seen.includes(r)) seen.push(r);
  }
  const ordered = [...seen, ...mine.filter((r) => !seen.includes(r))];
  const first = nearby[0];
  const atStore = first && first.distanceKm <= AT_STORE_KM && allowed.has(first.store.retailerId) ? first.store : undefined;
  return { ordered, atStore };
}
