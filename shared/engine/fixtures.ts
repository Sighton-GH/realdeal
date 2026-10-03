// Hand-built fixture store for verdict tests: 4 items x 4 retailers x 26 weeks, every number controlled.
import type { Item, PricePoint, PriceStore, RetailerId, StoreLocation } from "../types";

export const RETAILER_IDS: RetailerId[] = ["saveon", "nofrills", "walmart", "tnt"];
export const WEEKS_26 = 26;
const END = "2026-09-28"; // Monday of the latest week

export function weekDates(count = WEEKS_26, end = END): string[] {
  const out: string[] = [];
  const d = new Date(end + "T00:00:00Z");
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i * 7);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}
export const DATES = weekDates();
export const LATEST = DATES[DATES.length - 1];
export const PREVIOUS = DATES[DATES.length - 2];

const mkItem = (id: string, name: string, sizeQty: number, unit: Item["unit"], sizeLabel: string, aliases: string[], category: Item["category"] = "dairy"): Item => ({
  id, name, category, sizeQty, unit, sizeLabel, artKey: "generic", aliases, searchQuery: name,
});

export const MILK = mkItem("milk-test", "Whole milk", 4, "L", "4 L", ["milk", "2%"]);
export const BUTTER = mkItem("butter-test", "Salted butter", 0.5, "kg", "500 g", ["butter"]);
export const PASTA = mkItem("pasta-test", "Spaghetti", 0.9, "kg", "900 g", ["noodles"], "pantry");
export const YOGURT = mkItem("yogurt-test", "Greek yogurt", 0.5, "kg", "500 g", ["yoghurt"]);
YOGURT.brand = "Olympic";

type Build = (week: number) => Partial<PricePoint> & { price: number };

function series(item: Item, retailerId: RetailerId, build: Build): PricePoint[] {
  return DATES.map((date, w) => {
    const b = build(w);
    return {
      itemId: item.id, retailerId, date,
      regularPrice: b.price, onSale: false, sizeQty: item.sizeQty, source: "seed" as const,
      ...b,
    };
  });
}
const flat = (price: number): Build => () => ({ price });

const milkPrices: Record<RetailerId, number> = { saveon: 6.0, nofrills: 5.5, walmart: 5.8, tnt: 6.2 };
// Butter: Save-On is on sale 10 of the latest 12 weeks (weeks 15..24); Walmart only 5 of 12 (weeks 20..24).
const butterSaveOn: Build = (w) => (w >= 15 && w <= 24 ? { price: 4, regularPrice: 5, onSale: true } : { price: 5 });
const butterWalmart: Build = (w) => (w >= 20 && w <= 24 ? { price: 4, regularPrice: 5, onSale: true } : { price: 5 });
// Pasta: usual single price 2.60 everywhere. T&T also ran two old multi-buy weeks at a silly shelf price
// that must not count toward the "usual single price".
const pastaTnt: Build = (w) => (w === 20 || w === 21 ? { price: 9.99, multiBuy: { qty: 2, total: 5 } } : { price: 2.6 });
// Yogurt: Walmart shrank from 650 g to 500 g in week 20 at the same shelf price.
const yogurtWalmart: Build = (w) => (w < 20 ? { price: 4, sizeQty: 0.65 } : { price: 4, sizeQty: 0.5 });

export const LOCATIONS: StoreLocation[] = [
  { id: "saveon-burnaby-1", retailerId: "saveon", name: "Save-On-Foods Burnaby", address: "1 Test St", lat: 49.2781, lng: -122.9199 },
  { id: "nofrills-burnaby-1", retailerId: "nofrills", name: "No Frills Burnaby", address: "2 Test St", lat: 49.265, lng: -122.95 },
  { id: "walmart-vancouver-1", retailerId: "walmart", name: "Walmart Vancouver", address: "3 Test St", lat: 49.2827, lng: -123.1207 },
  { id: "tnt-richmond-1", retailerId: "tnt", name: "T&T Richmond", address: "4 Test St", lat: 49.19, lng: -123.13 },
];

/** Branch point for the Save-On branch: latest week, cheaper than the chain, from a scrape. */
const branchSaveOnLatest: PricePoint = {
  itemId: MILK.id, retailerId: "saveon", date: LATEST, price: 4.8, regularPrice: 4.8, onSale: false,
  sizeQty: 4, source: "scrape", storeId: "saveon-burnaby-1",
};
/** Stale branch point (previous week only): must fall back to the chain price. */
const branchNoFrillsStale: PricePoint = {
  itemId: MILK.id, retailerId: "nofrills", date: PREVIOUS, price: 2, regularPrice: 2, onSale: false,
  sizeQty: 4, source: "scrape", storeId: "nofrills-burnaby-1",
};

export function buildFixtureStore(): PriceStore {
  const points: PricePoint[] = [];
  for (const r of RETAILER_IDS) {
    points.push(...series(MILK, r, flat(milkPrices[r])));
    points.push(...series(BUTTER, r, r === "saveon" ? butterSaveOn : r === "walmart" ? butterWalmart : flat(5)));
    points.push(...series(PASTA, r, r === "tnt" ? pastaTnt : flat(2.6)));
    points.push(...series(YOGURT, r, r === "walmart" ? yogurtWalmart : () => ({ price: 4, sizeQty: 0.65 })));
  }
  points.push(branchSaveOnLatest, branchNoFrillsStale);
  return { items: [MILK, BUTTER, PASTA, YOGURT], points, locations: LOCATIONS, generatedAt: "2026-09-29T00:00:00.000Z" };
}
