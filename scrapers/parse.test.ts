import { describe, expect, it } from "vitest";
import { parseMultiBuy, parsePrice, parseSize } from "./parse";

describe("parseSize", () => {
  it("parses grams and kilograms", () => {
    expect(parseSize("454 g")).toEqual({ qty: 0.454, unit: "kg" });
    expect(parseSize("454g")).toEqual({ qty: 0.454, unit: "kg" });
    expect(parseSize("0.454 kg")).toEqual({ qty: 0.454, unit: "kg" });
    expect(parseSize("1.36 kg")).toEqual({ qty: 1.36, unit: "kg" });
    expect(parseSize("650 g")).toEqual({ qty: 0.65, unit: "kg" });
  });

  it("parses milliliters and liters", () => {
    expect(parseSize("4 L")).toEqual({ qty: 4, unit: "L" });
    expect(parseSize("4L")).toEqual({ qty: 4, unit: "L" });
    expect(parseSize("500 mL")).toEqual({ qty: 0.5, unit: "L" });
    expect(parseSize("500ml")).toEqual({ qty: 0.5, unit: "L" });
  });

  it("parses packs, counts, and items", () => {
    expect(parseSize("12 pack")).toEqual({ qty: 12, unit: "each" });
    expect(parseSize("12 x 1")).toEqual({ qty: 12, unit: "each" });
    expect(parseSize("6 pk")).toEqual({ qty: 6, unit: "each" });
  });

  it("parses dozen and eggs", () => {
    expect(parseSize("dozen")).toEqual({ qty: 1, unit: "dozen" });
    expect(parseSize("12 eggs")).toEqual({ qty: 1, unit: "dozen" });
  });

  it("parses per-weight produce markers", () => {
    expect(parseSize("per kg")).toEqual({ qty: 1, unit: "kg" });
    expect(parseSize("/kg")).toEqual({ qty: 1, unit: "kg" });
    expect(parseSize("per lb")).toEqual({ qty: 1, unit: "kg" });
    expect(parseSize("/lb")).toEqual({ qty: 1, unit: "kg" });
  });

  it("parses pounds bag to kilograms", () => {
    expect(parseSize("3 lb bag")).toEqual({ qty: 1.36, unit: "kg" });
    expect(parseSize("2 lb bag")).toEqual({ qty: 0.907, unit: "kg" });
    expect(parseSize("10 lb bag")).toEqual({ qty: 4.54, unit: "kg" });
  });
});

describe("parseMultiBuy", () => {
  it("parses standard multi-buy deals", () => {
    expect(parseMultiBuy("2 for $5")).toEqual({ qty: 2, total: 5 });
    expect(parseMultiBuy("2/$5.00")).toEqual({ qty: 2, total: 5 });
    expect(parseMultiBuy("2 FOR 5.00")).toEqual({ qty: 2, total: 5 });
    expect(parseMultiBuy("Buy 2 for $5")).toEqual({ qty: 2, total: 5 });
    expect(parseMultiBuy("2 @ $5")).toEqual({ qty: 2, total: 5 });
  });

  it("returns null for non-multibuy strings", () => {
    expect(parseMultiBuy("$5.99 each")).toBeNull();
    expect(parseMultiBuy("sale price")).toBeNull();
  });
});

describe("parsePrice", () => {
  it("parses raw and dollar formatted prices", () => {
    expect(parsePrice("$5.99")).toEqual({ price: 5.99 });
    expect(parsePrice("5.99")).toEqual({ price: 5.99 });
    expect(parsePrice("$5")).toEqual({ price: 5 });
    expect(parsePrice("5,99")).toEqual({ price: 5.99 });
  });

  it("parses unit qualifiers", () => {
    expect(parsePrice("$1.29/lb")).toEqual({ price: 1.29, per: "lb" });
    expect(parsePrice("$2.84/kg")).toEqual({ price: 2.84, per: "kg" });
    expect(parsePrice("$0.99/100g")).toEqual({ price: 0.99, per: "100g" });
    expect(parsePrice("$1.49 ea")).toEqual({ price: 1.49, per: "each" });
  });

  it("ignores surrounding text", () => {
    expect(parsePrice("Special deal $4.99 only")).toEqual({ price: 4.99 });
  });
});
describe("parseSize multipacks", () => {
  it("multiplies 'N x size' when the size has a unit", () => {
    expect(parseSize("2 x 454 g")).toEqual({ qty: 0.908, unit: "kg" });
    expect(parseSize("6 x 355 mL")).toEqual({ qty: 2.13, unit: "L" });
  });
  it("keeps '12 x 1' as a 12 count", () => {
    expect(parseSize("12 x 1")).toEqual({ qty: 12, unit: "each" });
  });
});
