import { describe, expect, it } from "vitest";
import { EXPANDED_ITEMS } from "./seed/expanded-items";
import { generateSeedStore } from "./seed/generate";
import { getItemDetail, searchItems } from "./verdict";
import prices from "../data/prices.json";
import type { PriceStore } from "./types";
describe("real-data-only categories", () => {
  it("covers every new category without invented seed prices", () => {
    expect(new Set(EXPANDED_ITEMS.map((i) => i.category))).toEqual(new Set(["meat", "seafood", "frozen", "snacks", "drinks", "household"]));
    const ids = new Set(EXPANDED_ITEMS.map((i) => i.id));
    expect(generateSeedStore().points.filter((p) => ids.has(p.itemId))).toHaveLength(0);
  });
  it("every new package has actual history and can be found by category", () => {
    const store = prices as PriceStore;
    for (const item of EXPANDED_ITEMS) {
      const detail = getItemDetail(store, item.id);
      expect(detail.history.length).toBeGreaterThan(0);
      expect(detail.history.every((p) => p.source === "hammer" && p.sizeQty === item.sizeQty)).toBe(true);
      expect(searchItems(store, "", item.category).some((i) => i.id === item.id)).toBe(true);
    }
  });
});
