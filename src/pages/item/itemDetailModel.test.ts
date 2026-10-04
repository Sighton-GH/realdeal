import { describe, expect, it } from "vitest";
import { checkPrice, generateSeedStore, getItemDetail, unitPriceOf } from "@shared/verdict";
import { checkInput, currentOffer, historyFor, unitLabel } from "./itemDetailModel";

const seed = generateSeedStore();

describe("item detail offer evidence", () => {
  it("shows the butter forever-sale count and preserves the was price for checks", () => {
    const detail = getItemDetail(seed, "butter-salted-454g");
    const stats = detail.stats.byRetailer.find((r) => r.retailerId === "saveon")!;
    expect(historyFor(detail, "saveon").slice(-12).filter((p) => p.onSale).length).toBeGreaterThanOrEqual(6);
    const input = checkInput(detail, stats);
    expect(input.wasPrice).toBe(8.49);
    expect(checkPrice(seed, input).tricks.map((t) => t.type)).toContain("perpetual_sale");
  });

  it("compares yogurt with each week's real package size", () => {
    const detail = getItemDetail(seed, "greek-yogurt-plain");
    const stats = detail.stats.byRetailer.find((r) => r.retailerId === "walmart")!;
    const history = historyFor(detail, stats.retailerId);
    expect(new Set(history.map((p) => p.sizeQty)).size).toBeGreaterThan(1);
    expect(checkInput(detail, stats).sizeQty).toBe(0.5);
    expect(currentOffer(detail, stats).unitPrice).toBeCloseTo(5.97 / 0.5);
    expect(checkPrice(seed, checkInput(detail, stats)).tricks.map((t) => t.type)).toContain("shrinkflation");
  });

  it("passes the pasta multi-buy to the engine without double-discounting", () => {
    const detail = getItemDetail(seed, "spaghetti-900g");
    const stats = detail.stats.byRetailer.find((r) => r.retailerId === "tnt")!;
    const input = checkInput(detail, stats);
    expect(input.multiBuy).toEqual({ qty: 2, total: 5 });
    expect(currentOffer(detail, stats).unitPrice).toBeCloseTo(unitPriceOf(2.5, 0.9, input.multiBuy));
    expect(checkPrice(seed, input).tricks.map((t) => t.type)).toContain("multibuy_trap");
  });

  it("supports a per-kg produce item", () => {
    const item = seed.items.find((i) => i.category === "produce" && i.unit === "kg" && i.sizeQty === 1)!;
    const detail = getItemDetail(seed, item.id);
    expect(unitLabel[item.unit]).toBe("Per kg");
    for (const stats of detail.stats.byRetailer) {
      expect(currentOffer(detail, stats).unitPrice).toBeCloseTo(stats.currentPrice);
    }
  });

  it("excludes branch observations and sorts unsorted chain history", () => {
    const detail = getItemDetail(seed, "butter-salted-454g");
    const point = historyFor(detail, "saveon")[0];
    const mixed = { ...detail, history: [...detail.history].reverse().concat({ ...point, storeId: "branch", price: 999 }) };
    const history = historyFor(mixed, "saveon");
    expect(history[0].date).toBe(point.date);
    expect(history.some((p) => p.storeId)).toBe(false);
  });
});
