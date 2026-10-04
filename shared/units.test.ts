import { describe, expect, it } from "vitest";
import type { Item } from "./types";
import { amountForItem, compatibleUnits, formatTagAmount, fromItemUnits, LB_KG, parseTagAmount, sameAmount, toItemUnits } from "./units";

const item = (unit: Item["unit"], sizeQty: number): Item => ({
  id: "x", name: "X", category: "produce", sizeQty, unit, sizeLabel: "", artKey: "generic", aliases: [], searchQuery: "x",
});

describe("toItemUnits", () => {
  it("converts weights to kg", () => {
    expect(toItemUnits({ qty: 1, unit: "lb" }, "kg")).toBeCloseTo(0.45359237, 8);
    expect(toItemUnits({ qty: 454, unit: "g" }, "kg")).toBeCloseTo(0.454, 8);
    expect(toItemUnits({ qty: 16, unit: "oz" }, "kg")).toBeCloseTo(0.45359237, 6);
    expect(toItemUnits({ qty: 2, unit: "kg" }, "kg")).toBe(2);
  });
  it("converts volumes to L and counts both ways", () => {
    expect(toItemUnits({ qty: 500, unit: "mL" }, "L")).toBeCloseTo(0.5, 8);
    expect(toItemUnits({ qty: 12, unit: "each" }, "dozen")).toBeCloseTo(1, 8);
    expect(toItemUnits({ qty: 1, unit: "dozen" }, "each")).toBe(12);
  });
  it("returns undefined for units that do not convert or a non-positive qty", () => {
    expect(toItemUnits({ qty: 1, unit: "lb" }, "L")).toBeUndefined();
    expect(toItemUnits({ qty: 1, unit: "L" }, "kg")).toBeUndefined();
    expect(toItemUnits({ qty: 0, unit: "kg" }, "kg")).toBeUndefined();
  });
});

describe("compatibleUnits", () => {
  it("lists the tag units for each item unit", () => {
    expect(compatibleUnits("kg")).toEqual(["g", "kg", "lb", "oz"]);
    expect(compatibleUnits("L")).toEqual(["mL", "L"]);
    expect(compatibleUnits("each")).toEqual(["each", "dozen"]);
    expect(compatibleUnits("dozen")).toEqual(["dozen", "each"]);
  });
});

describe("fromItemUnits", () => {
  it("uses g / mL below 1 kg / 1 L", () => {
    expect(fromItemUnits(0.454, "kg")).toEqual({ qty: 454, unit: "g" });
    expect(fromItemUnits(1, "kg")).toEqual({ qty: 1, unit: "kg" });
    expect(fromItemUnits(0.5, "L")).toEqual({ qty: 500, unit: "mL" });
    expect(fromItemUnits(4, "L")).toEqual({ qty: 4, unit: "L" });
    expect(fromItemUnits(6, "each")).toEqual({ qty: 6, unit: "each" });
    expect(fromItemUnits(1, "dozen")).toEqual({ qty: 1, unit: "dozen" });
  });
});

describe("formatTagAmount", () => {
  it("says per for one unit and for otherwise", () => {
    expect(formatTagAmount({ qty: 1, unit: "lb" })).toBe("per lb");
    expect(formatTagAmount({ qty: 1, unit: "kg" })).toBe("per kg");
    expect(formatTagAmount({ qty: 1, unit: "each" })).toBe("each");
    expect(formatTagAmount({ qty: 1, unit: "dozen" })).toBe("per dozen");
    expect(formatTagAmount({ qty: 454, unit: "g" })).toBe("for 454 g");
    expect(formatTagAmount({ qty: 1.89, unit: "L" })).toBe("for 1.89 L");
    expect(formatTagAmount({ qty: 12, unit: "each" })).toBe("for 12 pack");
    expect(formatTagAmount({ qty: 100, unit: "g" })).toBe("for 100 g");
  });
});

describe("parseTagAmount", () => {
  it("reads bare and slashed units as one unit", () => {
    expect(parseTagAmount("lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("/lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("per lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("/KG")).toEqual({ qty: 1, unit: "kg" });
    expect(parseTagAmount("ea")).toEqual({ qty: 1, unit: "each" });
    expect(parseTagAmount("dozen")).toEqual({ qty: 1, unit: "dozen" });
  });
  it("reads quantities", () => {
    expect(parseTagAmount("454 g")).toEqual({ qty: 454, unit: "g" });
    expect(parseTagAmount("/100g")).toEqual({ qty: 100, unit: "g" });
    expect(parseTagAmount("1.89 L")).toEqual({ qty: 1.89, unit: "L" });
    expect(parseTagAmount("500 mL")).toEqual({ qty: 500, unit: "mL" });
    expect(parseTagAmount("12 pack")).toEqual({ qty: 12, unit: "each" });
    expect(parseTagAmount("1,5 kg")).toEqual({ qty: 1.5, unit: "kg" });
    expect(parseTagAmount("2 x 454 g")).toEqual({ qty: 908, unit: "g" });
  });
  it("strips money so a price is never read as a quantity", () => {
    expect(parseTagAmount("$1.27 lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("lb/ $2.81 kg")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("$11.94 / KG")).toEqual({ qty: 1, unit: "kg" });
  });
  it("returns undefined when there is no unit", () => {
    expect(parseTagAmount("")).toBeUndefined();
    expect(parseTagAmount(null)).toBeUndefined();
    expect(parseTagAmount("Banana Plantain")).toBeUndefined();
    expect(parseTagAmount("$5.99")).toBeUndefined();
  });
});

describe("amountForItem", () => {
  it("keeps a compatible tag amount", () => {
    expect(amountForItem({ qty: 1, unit: "lb" }, item("kg", 1))).toEqual({ amount: { qty: 1, unit: "lb" }, fromTag: true });
  });
  it("falls back to the catalogue size when missing or incompatible", () => {
    expect(amountForItem(undefined, item("kg", 0.454))).toEqual({ amount: { qty: 454, unit: "g" }, fromTag: false });
    expect(amountForItem({ qty: 1, unit: "L" }, item("kg", 1))).toEqual({ amount: { qty: 1, unit: "kg" }, fromTag: false });
  });
});

describe("sameAmount", () => {
  it("compares in item units within a tolerance", () => {
    expect(sameAmount({ qty: 454, unit: "g" }, { qty: 1, unit: "lb" }, "kg")).toBe(true);
    expect(sameAmount({ qty: 1, unit: "kg" }, { qty: 1, unit: "lb" }, "kg")).toBe(false);
    expect(LB_KG).toBe(0.45359237);
  });
});
