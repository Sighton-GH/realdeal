// PLACEHOLDER (SPEC-00). DATA-04 replaces; keep `export const mockApi: Api`.
import type { Api, DataStatus, ScanResult } from "@shared/types";
import { checkPrice, generateSeedStore, getItemDetail, getNearbyPrices, searchItems } from "@shared/verdict";
import { getFeaturedDeals } from "@shared/seed/featured";
import { TRICKS } from "@shared/content/tricks";
import { RETAILERS } from "@shared/retailers";

const store = generateSeedStore();
const wait = <T,>(value: () => T, ms = 350): Promise<T> =>
  new Promise((resolve, reject) => setTimeout(() => { try { resolve(value()); } catch (e) { reject(e); } }, ms));

export const mockApi: Api = {
  searchItems: (q, category) => wait(() => searchItems(store, q, category)),
  getItem: (id) => wait(() => getItemDetail(store, id)),
  getFeatured: () => wait(() => getFeaturedDeals(store)),
  checkPrice: (input) => wait(() => checkPrice(store, input)),
  scanImage: () =>
    wait<ScanResult>(() => ({
      status: "ok",
      candidates: [store.items[0]],
      price: 5.99,
      wasPrice: 8.49,
      retailerId: "saveon",
      rawText: "SALE 5.99 WAS 8.49 SALTED BUTTER 454G",
    }), 1800),
  listTricks: () => wait(() => TRICKS),
  getDataStatus: () =>
    wait<DataStatus>(() => ({
      mode: "mock",
      updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      sources: ["seed"],
      retailers: RETAILERS.map((r) => ({ retailerId: r.id, ok: true, itemsFound: store.items.length })),
    })),
  getNearbyPrices: (itemId, near, limit) => wait(() => getNearbyPrices(store, itemId, near, limit)),
};
