// PLACEHOLDER (SPEC-00). DATA-02 replaces with the deterministic generator; keep `generateSeedStore(): PriceStore`.
import type { PricePoint, PriceStore, RetailerId } from "../types";
import { RETAILERS } from "../retailers";
import { DATA_END, WEEKS } from "./constants";
import { SEED_ITEMS } from "./items";
import { LOCATIONS } from "./locations";

export function mondays(end: string, count: number): string[] {
  const out: string[] = [];
  const d = new Date(end + "T00:00:00Z");
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i * 7);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

const MULT: Record<RetailerId, number> = { saveon: 1.08, nofrills: 0.92, walmart: 0.95, tnt: 1.03 };

export function generateSeedStore(): PriceStore {
  const dates = mondays(DATA_END, WEEKS);
  const points: PricePoint[] = [];
  for (const { item, basePrice } of SEED_ITEMS) {
    for (const r of RETAILERS) {
      for (const date of dates) {
        const price = Math.round(basePrice * MULT[r.id] * 100) / 100;
        points.push({ itemId: item.id, retailerId: r.id, date, price, regularPrice: price, onSale: false, sizeQty: item.sizeQty, source: "seed" });
      }
    }
  }
  return { items: SEED_ITEMS.map((s) => s.item), points, locations: LOCATIONS, generatedAt: new Date(DATA_END + "T12:00:00Z").toISOString() };
}
