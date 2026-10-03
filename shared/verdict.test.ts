import { describe, expect, it } from "vitest";
import {
  checkPrice, distanceKm, getItemDetail, getNearbyPrices, mergeStores, searchItems, tierFor, unitPriceOf,
} from "./verdict";
import type { PriceCheckInput, PricePoint, RetailerId } from "./types";
import { BUTTER, DATES, LATEST, MILK, PASTA, YOGURT, buildFixtureStore } from "./engine/fixtures";

const store = buildFixtureStore();
const input = (over: Partial<PriceCheckInput> & Pick<PriceCheckInput, "itemId" | "retailerId" | "price">): PriceCheckInput => ({
  source: "manual", ...over,
});
const trickTypes = (v: { tricks: { type: string }[] }) => v.tricks.map((t) => t.type);

/** Independent reference: mean unit price of the latest 13 chain points per retailer. */
function refAvg(itemId: string): number {
  const units: number[] = [];
  for (const r of ["saveon", "nofrills", "walmart", "tnt"] as RetailerId[]) {
    const pts = store.points.filter((p) => p.itemId === itemId && p.retailerId === r && !p.storeId)
      .sort((a, b) => a.date.localeCompare(b.date)).slice(-13);
    for (const p of pts) units.push((p.multiBuy ? p.multiBuy.total / p.multiBuy.qty : p.price) / p.sizeQty);
  }
  return units.reduce((a, b) => a + b, 0) / units.length;
}

describe("tierFor", () => {
  it("handles every boundary", () => {
    expect(tierFor(-0.3)).toBe("steal");
    expect(tierFor(-0.25)).toBe("steal");
    expect(tierFor(-0.2499)).toBe("good");
    expect(tierFor(-0.1)).toBe("good");
    expect(tierFor(-0.0999)).toBe("normal");
    expect(tierFor(0.1)).toBe("normal");
    expect(tierFor(0.1001)).toBe("high");
  });
});

describe("unitPriceOf", () => {
  it("uses the multi-buy per-unit price and does not round", () => {
    expect(unitPriceOf(5, 0.9, { qty: 2, total: 5 })).toBe(2.5 / 0.9);
    expect(unitPriceOf(5, 0.5)).toBe(10);
  });
});

describe("getItemDetail", () => {
  it("computes avg/low/high over the latest 13 chain points per store and ignores branch points", () => {
    const d = getItemDetail(store, MILK.id);
    expect(d.stats.avgUnit90).toBeCloseTo((6 + 5.5 + 5.8 + 6.2) / 4 / 4, 10);
    expect(d.stats.lowUnit90).toBeCloseTo(5.5 / 4, 10);
    expect(d.stats.highUnit90).toBeCloseTo(6.2 / 4, 10);
    expect(d.history.every((p) => !p.storeId)).toBe(true);
    expect(d.history).toHaveLength(104);
    expect(d.history[0].date <= d.history[d.history.length - 1].date).toBe(true);
  });
  it("uses only the latest 13 weeks, not older history", () => {
    const d = getItemDetail(store, BUTTER.id);
    expect(d.stats.avgUnit90).toBeCloseTo(refAvg(BUTTER.id), 10);
    // Save-On: weeks 13,14,25 regular (unit 10), weeks 15..24 sale (unit 8)
    const saveon = d.stats.byRetailer.find((r) => r.retailerId === "saveon")!;
    expect(saveon.saleFreq12w).toBeCloseTo(10 / 12, 10);
    expect(saveon.currentUnitPrice).toBe(10);
    expect(saveon.onSale).toBe(false);
    expect(saveon.lastSeen).toBe(LATEST);
  });
  it("lists retailers in RETAILERS order and flags scrape sources as live", () => {
    const d = getItemDetail(store, MILK.id);
    expect(d.stats.byRetailer.map((r) => r.retailerId)).toEqual(["saveon", "nofrills", "walmart", "tnt"]);
    expect(d.stats.byRetailer.every((r) => r.live === false)).toBe(true);
    const scraped = mergeStores(store, [[{ ...store.points.find((p) => p.itemId === MILK.id && p.retailerId === "tnt" && p.date === LATEST && !p.storeId)!, source: "scrape" }]]);
    expect(getItemDetail(scraped, MILK.id).stats.byRetailer.find((r) => r.retailerId === "tnt")!.live).toBe(true);
  });
  it("throws for an unknown item", () => {
    expect(() => getItemDetail(store, "nope")).toThrow("Item not found");
  });
});

describe("checkPrice basics", () => {
  it("returns steal / good / normal / high against the average, ignoring branch points", () => {
    const avg = (6 + 5.5 + 5.8 + 6.2) / 4 / 4;
    const steal = checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 4 }));
    expect(steal.tier).toBe("steal");
    expect(steal.avgUnitPrice).toBeCloseTo(avg, 10); // the 4.80 branch point is not in the average
    expect(steal.pctVsAvg).toBeCloseTo((1 - avg) / avg, 10);
    expect(checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 5 })).tier).toBe("good");
    expect(checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 6 })).tier).toBe("normal");
    expect(checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 7 })).tier).toBe("high");
  });
  it("computes savings, low/high, sale frequency, data points", () => {
    const v = checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 5 }), new Date("2026-10-01T12:00:00Z"));
    const avg = 5.875 / 4;
    expect(v.unitPrice).toBe(1.25);
    expect(v.savingsVsAvg).toBeCloseTo((avg - 1.25) * 4, 10);
    expect(v.low90).toBeCloseTo(1.375, 10);
    expect(v.high90).toBeCloseTo(1.55, 10);
    expect(v.saleFreq12w).toBe(0);
    expect(v.dataPoints).toBe(104);
    expect(v.createdAt).toBe("2026-10-01T12:00:00.000Z");
    expect(v.checkId).toHaveLength(8);
    expect(v.tricks).toEqual([]);
  });
  it("uses input.sizeQty when given, else the retailer's latest size", () => {
    const v = checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 3, sizeQty: 2 }));
    expect(v.unitPrice).toBe(1.5);
    const y = checkPrice(store, input({ itemId: YOGURT.id, retailerId: "walmart", price: 4 }));
    expect(y.unitPrice).toBe(8); // walmart's latest size is 0.5, not the 0.65 other stores use
  });
  it("throws for an unknown item", () => {
    expect(() => checkPrice(store, input({ itemId: "nope", retailerId: "saveon", price: 1 }))).toThrow("Item not found");
  });
});

describe("best", () => {
  it("is the cheapest current unit price among stores when the input is dearer", () => {
    const v = checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 6 }));
    expect(v.best).toEqual({ retailerId: "nofrills", price: 5.5, unitPrice: 1.375 });
  });
  it("includes the input itself when it is the cheapest", () => {
    const v = checkPrice(store, input({ itemId: MILK.id, retailerId: "saveon", price: 5 }));
    expect(v.best).toEqual({ retailerId: "saveon", price: 5, unitPrice: 1.25 });
  });
  it("replaces the input store's own latest point with the input price", () => {
    // nofrills is cheapest on file at 5.50; a dearer input at nofrills must not still count as 5.50
    const v = checkPrice(store, input({ itemId: MILK.id, retailerId: "nofrills", price: 7 }));
    expect(v.best.retailerId).toBe("walmart");
    expect(v.best.price).toBe(5.8);
  });
});

describe("tricks", () => {
  it("perpetual sale fires (10 of 12 weeks, was price set) and inflated was price fires alongside", () => {
    const v = checkPrice(store, input({ itemId: BUTTER.id, retailerId: "saveon", price: 5, wasPrice: 8 }));
    const p = v.tricks.find((t) => t.type === "perpetual_sale")!;
    expect(p.title).toBe("Forever sale");
    expect(p.detail).toBe("Save-On-Foods has had this on sale 10 of the last 12 weeks. The sale price is really the regular price.");
    expect(p.stat).toBe("10 of 12 weeks");
    const w = v.tricks.find((t) => t.type === "inflated_was_price")!;
    expect(w.title).toBe("Inflated 'was' price");
    expect(w.stat).toBe("0 of 26 weeks");
    // 8.00 -> 5.00 = 38% claimed; unit 10 vs avg ~9.6 is above average, so real saving is nothing
    expect(w.detail).toBe("The tag claims 38% off, but it only sold for $8.00 in 0 of the last 26 weeks. Against the real average you're saving nothing.");
  });
  it("inflated was price reports the real saving when the price is below average", () => {
    const v = checkPrice(store, input({ itemId: BUTTER.id, retailerId: "nofrills", price: 4, wasPrice: 5.5 }));
    const w = v.tricks.find((t) => t.type === "inflated_was_price")!;
    const real = Math.round(-v.pctVsAvg * 100);
    expect(v.pctVsAvg).toBeLessThan(0);
    expect(w.detail).toContain(`you're saving ${real}%.`);
  });
  it("perpetual sale also fires when no was price is set but the latest point is on sale", () => {
    const sale: PricePoint[] = store.points.filter((p) => p.itemId === BUTTER.id && p.retailerId === "saveon" && p.date === LATEST && !p.storeId)
      .map((p) => ({ ...p, price: 4, onSale: true }));
    const s2 = mergeStores(store, [sale]);
    // weeks 15..24 on sale + latest week = 11 of the last 12
    const v = checkPrice(s2, input({ itemId: BUTTER.id, retailerId: "saveon", price: 4 }));
    expect(trickTypes(v)).toContain("perpetual_sale");
    expect(v.tricks.find((t) => t.type === "perpetual_sale")!.stat).toBe("11 of 12 weeks");
  });
  it("near miss: sale in 5 of 12 weeks is not a forever sale", () => {
    const v = checkPrice(store, input({ itemId: BUTTER.id, retailerId: "walmart", price: 4, wasPrice: 5 }));
    expect(trickTypes(v)).not.toContain("perpetual_sale");
    // and 21 of 26 weeks at the 5.00 'was' price means it is not inflated either
    expect(trickTypes(v)).not.toContain("inflated_was_price");
  });
  it("near miss: 10 of 12 weeks without a was price and not currently on sale is not flagged", () => {
    const v = checkPrice(store, input({ itemId: BUTTER.id, retailerId: "saveon", price: 5 }));
    expect(trickTypes(v)).toEqual([]);
  });

  it("multi-buy trap fires when the saving is under 5% (and ignores multi-buy history weeks)", () => {
    const v = checkPrice(store, input({ itemId: PASTA.id, retailerId: "tnt", price: 5, multiBuy: { qty: 2, total: 5 } }));
    const t = v.tricks.find((x) => x.type === "multibuy_trap")!;
    expect(t.title).toBe("Multi-buy trap");
    expect(t.detail).toBe("Buying 2 saves you just $0.10 each compared with its usual single price.");
    expect(t.stat).toBe("$0.10 each");
  });
  it("multi-buy trap says so when buying more costs more each", () => {
    const v = checkPrice(store, input({ itemId: PASTA.id, retailerId: "tnt", price: 5.4, multiBuy: { qty: 2, total: 5.4 } }));
    expect(v.tricks.find((x) => x.type === "multibuy_trap")!.detail).toBe("Buying 2 actually costs $0.10 more each than buying one.");
  });
  it("near miss: a 6% multi-buy saving is not a trap", () => {
    const v = checkPrice(store, input({ itemId: PASTA.id, retailerId: "tnt", price: 4.88, multiBuy: { qty: 2, total: 4.88 } }));
    expect(trickTypes(v)).not.toContain("multibuy_trap");
  });
  it("exact boundary: saving of exactly 5% still flags", () => {
    const v = checkPrice(store, input({ itemId: PASTA.id, retailerId: "walmart", price: 4.94, multiBuy: { qty: 2, total: 4.94 } }));
    expect(trickTypes(v)).toContain("multibuy_trap"); // 2.47 >= 2.6 * 0.95
  });

  it("shrinkflation fires when size drops 5%+ and the unit price rises 3%+", () => {
    const v = checkPrice(store, input({ itemId: YOGURT.id, retailerId: "walmart", price: 4, sizeQty: 0.5 }));
    const t = v.tricks.find((x) => x.type === "shrinkflation")!;
    expect(t.title).toBe("Shrinkflation");
    expect(t.detail).toBe("This shrank from 650 g to 500 g, and the price per kg went up 30%.");
    expect(t.stat).toBe("23% smaller");
  });
  it("near miss: a 4% smaller package is not shrinkflation", () => {
    const v = checkPrice(store, input({ itemId: YOGURT.id, retailerId: "walmart", price: 4, sizeQty: 0.624 }));
    expect(trickTypes(v)).not.toContain("shrinkflation");
  });
  it("near miss: smaller package but the unit price did not rise 3% is not shrinkflation", () => {
    const v = checkPrice(store, input({ itemId: YOGURT.id, retailerId: "walmart", price: 3, sizeQty: 0.5 }));
    expect(trickTypes(v)).not.toContain("shrinkflation");
  });
  it("no tricks for a boring price", () => {
    expect(checkPrice(store, input({ itemId: MILK.id, retailerId: "walmart", price: 5.8 })).tricks).toEqual([]);
  });
});

describe("mergeStores", () => {
  const base = store.points.find((p) => p.itemId === MILK.id && p.retailerId === "saveon" && p.date === LATEST && !p.storeId)!;
  it("later overlays replace a point with the same key and keep their source", () => {
    const merged = mergeStores(store, [[{ ...base, price: 5.9, source: "hammer" }], [{ ...base, price: 5.1, source: "scrape" }]]);
    const hit = merged.points.filter((p) => p.itemId === MILK.id && p.retailerId === "saveon" && p.date === LATEST && !p.storeId);
    expect(hit).toHaveLength(1);
    expect(hit[0].price).toBe(5.1);
    expect(hit[0].source).toBe("scrape");
    expect(merged.points).toHaveLength(store.points.length);
  });
  it("keeps branch points separate from chain points", () => {
    const merged = mergeStores(store, [[{ ...base, price: 5.1, source: "scrape" }]]);
    const branch = merged.points.find((p) => p.storeId === "saveon-burnaby-1")!;
    expect(branch.price).toBe(4.8);
    const branchOverlay = mergeStores(store, [[{ ...base, storeId: "saveon-burnaby-1", price: 4.5, source: "scrape" }]]);
    expect(branchOverlay.points.find((p) => p.storeId === "saveon-burnaby-1")!.price).toBe(4.5);
    expect(branchOverlay.points.find((p) => p.itemId === MILK.id && p.retailerId === "saveon" && p.date === LATEST && !p.storeId)!.price).toBe(6);
  });
  it("adds new points, takes items and locations from base, and does not mutate base", () => {
    const extra: PricePoint = { ...base, date: "2026-10-05" };
    const merged = mergeStores(store, [[extra]]);
    expect(merged.points).toHaveLength(store.points.length + 1);
    expect(merged.items).toBe(store.items);
    expect(merged.locations).toBe(store.locations);
    expect(store.points.some((p) => p.date === "2026-10-05")).toBe(false);
  });
});

describe("distanceKm", () => {
  it("SFU Burnaby to downtown Vancouver is about 14.6 km", () => {
    const d = distanceKm({ lat: 49.2781, lng: -122.9199 }, { lat: 49.2827, lng: -123.1207 });
    expect(d).toBeGreaterThan(14.3);
    expect(d).toBeLessThan(14.9);
  });
  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 1, lng: 2 }, { lat: 1, lng: 2 })).toBe(0);
  });
});

describe("getNearbyPrices", () => {
  const sfu = { lat: 49.2781, lng: -122.9199 };
  it("sorts by distance and respects limit", () => {
    const all = getNearbyPrices(store, MILK.id, sfu);
    expect(all.map((n) => n.store.id)).toEqual(["saveon-burnaby-1", "nofrills-burnaby-1", "walmart-vancouver-1", "tnt-richmond-1"]);
    for (let i = 1; i < all.length; i++) expect(all[i].distanceKm).toBeGreaterThanOrEqual(all[i - 1].distanceKm);
    expect(getNearbyPrices(store, MILK.id, sfu, 2)).toHaveLength(2);
  });
  it("uses the branch price when it is in the latest week, with tier and live flag", () => {
    const n = getNearbyPrices(store, MILK.id, sfu)[0];
    const avg = 5.875 / 4;
    expect(n.priceScope).toBe("store");
    expect(n.price).toBe(4.8);
    expect(n.unitPrice).toBeCloseTo(1.2, 10);
    expect(n.tier).toBe("good"); // (1.2 - avg) / avg is about -18%
    expect((1.2 - avg) / avg).toBeLessThan(-0.1);
    expect(n.live).toBe(true);
    expect(n.date).toBe(LATEST);
  });
  it("falls back to the chain price when the branch point is stale or absent", () => {
    const [, nofrills, walmart] = getNearbyPrices(store, MILK.id, sfu);
    expect(nofrills.priceScope).toBe("chain"); // its branch point is from the previous week
    expect(nofrills.price).toBe(5.5);
    expect(nofrills.tier).toBe("normal");
    expect(nofrills.live).toBe(false);
    expect(walmart.priceScope).toBe("chain");
    expect(walmart.price).toBe(5.8);
  });
  it("throws for an unknown item", () => {
    expect(() => getNearbyPrices(store, "nope", sfu)).toThrow("Item not found");
  });
});

describe("searchItems", () => {
  it("matches name, brand, and aliases case-insensitively, sorted by name", () => {
    expect(searchItems(store, "MILK").map((i) => i.id)).toEqual([MILK.id]);
    expect(searchItems(store, "olympic").map((i) => i.id)).toEqual([YOGURT.id]);
    expect(searchItems(store, "noodles").map((i) => i.id)).toEqual([PASTA.id]);
    expect(searchItems(store, "  ").map((i) => i.name)).toEqual(["Greek yogurt", "Salted butter", "Spaghetti", "Whole milk"]);
  });
  it("filters by category and returns nothing for no match", () => {
    expect(searchItems(store, "", "pantry").map((i) => i.id)).toEqual([PASTA.id]);
    expect(searchItems(store, "zzz")).toEqual([]);
  });
});

describe("fixture sanity", () => {
  it("has 26 weeks of chain data per item per retailer", () => {
    expect(DATES).toHaveLength(26);
    for (const item of store.items) {
      expect(store.points.filter((p) => p.itemId === item.id && !p.storeId)).toHaveLength(104);
    }
  });
});
