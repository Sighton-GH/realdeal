import { describe, expect, it } from "vitest";
import { RETAILERS } from "@shared/retailers";
import { tileClass } from "@/components/ui/StoreTile";
import { ITEMS } from "@shared/seed/items";
import { displayedPrice } from "./priceDisplay";
import { useAppStore } from "@/store/useAppStore";

describe("price display preference", () => {
  it("keeps shelf and normalized prices separate", () => {
    const butter = ITEMS.find((item) => item.id === "butter-salted-454g")!;
    expect(displayedPrice(5, 5 / 0.454, butter, "package")).toEqual({ amount: 5, unit: undefined });
    expect(displayedPrice(5, 5 / 0.454, butter, "unit")).toEqual({ amount: 5 / 0.454, unit: "kg" });
  });
  it("labels loose produce per kg in both modes", () => {
    const item = ITEMS.find((item) => item.sizeLabel === "per kg")!;
    expect(displayedPrice(2, 2, item, "package")).toEqual({ amount: 2, unit: "kg" });
  });
  it("uses L, each and dozen rather than inventing weights", () => {
    for (const unit of ["L", "each", "dozen"] as const) {
      const item = ITEMS.find((item) => item.unit === unit)!;
      expect(displayedPrice(6, 3, item, "unit")).toEqual({ amount: 3, unit });
    }
  });
  it("updates the same preference used by item history", () => {
    useAppStore.getState().setPriceDisplay("unit");
    expect(useAppStore.getState().priceDisplay).toBe("unit");
    useAppStore.getState().setPriceDisplay("package");
    expect(useAppStore.getState().priceDisplay).toBe("package");
  });
});


it("gives every store a distinct tile colour and a usable CSS class", () => {
  expect(new Set(RETAILERS.map((retailer) => retailer.tile)).size).toBe(RETAILERS.length);
  for (const retailer of RETAILERS) expect(tileClass[retailer.tile]).toContain(`bg-${retailer.tile}`);
});
