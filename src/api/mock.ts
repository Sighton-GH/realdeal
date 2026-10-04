// DATA-04: complete mock API. Runs the shared engine in the browser against the seed store.
import type { Api, DataStatus, Item, MultiBuy, PriceStore, RetailerId, ScanResult } from "@shared/types";
import { checkPrice, generateSeedStore, getItemDetail, getNearbyPrices, searchItems } from "@shared/verdict";
import { getFeaturedDeals } from "@shared/seed/featured";
import { TRICKS } from "@shared/content/tricks";
import { RETAILERS } from "@shared/retailers";
import { getStoreItems, getStoreSummaries, dropUnknownRetailers } from "@shared/stores";

// Use the merged real-data store (data/prices.json from `npm run merge:data`) when it exists, else the seed store.
const bundled = import.meta.glob("../../data/prices.json", { eager: true, import: "default" }) as Record<string, PriceStore>;
const raw = Object.values(bundled)[0];
const store: PriceStore = raw ? dropUnknownRetailers(raw) : generateSeedStore();

const LATENCY_MS = 350;
const SCAN_LATENCY_MS = 1800;

const wait = <T,>(value: () => T, ms: number = LATENCY_MS): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(value());
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    }, ms);
  });

interface CannedScan {
  itemId: string;
  retailerId: RetailerId;
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  sizeQty?: number;
  rawText?: string;
}

const SAMPLES: Record<string, CannedScan> = {
  "sample-butter": { itemId: "butter-salted-454g", retailerId: "saveon", price: 5.99, wasPrice: 8.49 },
  "sample-yogurt": { itemId: "greek-yogurt-plain", retailerId: "walmart", price: 5.97, sizeQty: 0.5 },
  "sample-pasta": { itemId: "spaghetti-900g", retailerId: "tnt", price: 2.5, multiBuy: { qty: 2, total: 5 } },
};

const DEFAULT_SCAN: CannedScan = {
  ...SAMPLES["sample-butter"],
  rawText: "SALE 5.99 WAS 8.49 SALTED BUTTER 454G",
};

/** The matched item first, then 2 other items from the same category. */
function candidatesFor(item: Item): Item[] {
  const others = store.items.filter((i) => i.id !== item.id && i.category === item.category).slice(0, 2);
  return [item, ...others];
}

function cannedScan(sampleId: string | undefined): ScanResult {
  const canned = (sampleId ? SAMPLES[sampleId] : undefined) ?? DEFAULT_SCAN;
  const item = store.items.find((i) => i.id === canned.itemId);
  if (!item) {
    return { status: "error", candidates: [], message: "Couldn't read that tag. Try a sample or enter the price." };
  }
  const result: ScanResult = {
    status: "ok",
    candidates: candidatesFor(item),
    price: canned.price,
    retailerId: canned.retailerId,
  };
  if (canned.wasPrice !== undefined) result.wasPrice = canned.wasPrice;
  if (canned.multiBuy) result.multiBuy = canned.multiBuy;
  if (canned.sizeQty !== undefined) result.sizeQty = canned.sizeQty;
  if (canned.rawText) result.rawText = canned.rawText;
  return result;
}

export const mockApi: Api = {
  searchItems: (q, category) =>
    wait(() => {
      const found = searchItems(store, q, category);
      return found.slice().sort((a, b) => a.name.localeCompare(b.name));
    }),
  getItem: (id) =>
    wait(() => {
      if (!store.items.some((i) => i.id === id)) throw new Error("Item not found");
      return getItemDetail(store, id);
    }),
  getFeatured: () => wait(() => getFeaturedDeals(store)),
  checkPrice: (input) => wait(() => checkPrice(store, input)),
  scanImage: (_image, sampleId) => wait(() => cannedScan(sampleId), SCAN_LATENCY_MS),
  listTricks: () => wait(() => TRICKS),
  getDataStatus: () =>
    wait<DataStatus>(() => ({
      mode: "mock",
      updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      sources: Array.from(new Set(store.points.map((p) => p.source))),
      retailers: RETAILERS.map((r) => ({
        retailerId: r.id,
        ok: true,
        itemsFound: new Set(store.points.filter((p) => p.retailerId === r.id).map((p) => p.itemId)).size,
      })),
    })),
  getStores: () => wait(() => getStoreSummaries(store)),
  getStoreItems: (retailerId: RetailerId) => wait(() => getStoreItems(store, retailerId)),
  getNearbyPrices: (itemId, near, limit) => wait(() => getNearbyPrices(store, itemId, near, limit)),
};
