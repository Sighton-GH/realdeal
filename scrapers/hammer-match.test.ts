import { describe, expect, it } from "vitest";
import { ITEMS } from "../shared/seed/items";
import { matchHammerProduct } from "./hammer-match";
import { parseSize } from "./parse";

const milk = ITEMS.filter((i) => i.id === "milk-2pct-4l" || i.id === "milk-2pct-2l");
const match = (title: string, sizeText?: string, items = milk) => matchHammerProduct(items, { title, sizeText, price: 5 });
describe("Hammer package matching", () => {
  it("uses title sizes when Hammer units say 1 ea", () => expect(match("2% milk 2 L", "1 ea")?.item.id).toBe("milk-2pct-2l"));
  it("rejects unknown size rather than picking the first milk package", () => expect(match("2% milk", "1 ea")).toBeNull());
  it("rejects a different size, including sizes inside the scraper's 15% tolerance", () => expect(match("2% milk", "3.5 L")).toBeNull());
  it("rejects conflicting physical sizes", () => expect(match("2% milk 4 L", "2 L")).toBeNull());
  it("normalises mL and multipacks", () => {
    expect(match("2% milk", "2000 mL")?.item.id).toBe("milk-2pct-2l");
    expect(match("2% milk", "2 x 2 L")?.item.id).toBe("milk-2pct-4l");
  });
  it("rejects a tie between identical catalogue entries", () => expect(match("2% milk 2 L", undefined, [milk[1], { ...milk[1], id: "duplicate" }])).toBeNull());
  it("requires an explicit per-weight price basis for per-kg produce", () => {
    const bananas = ITEMS.filter((i) => i.id === "bananas-kg");
    expect(match("Bananas", "per lb", bananas)?.item.id).toBe("bananas-kg");
    expect(match("Bananas", "1 kg", bananas)).toBeNull();
    expect(match("Bananas", "each", bananas)).toBeNull();
  });
  it("does not turn an 18-pack of eggs into a dozen", () => {
    const eggs = ITEMS.filter((i) => i.id === "eggs-large-12");
    expect(match("Large eggs", "12 ea", eggs)?.item.id).toBe("eggs-large-12");
    expect(match("Large eggs", "18 ea", eggs)).toBeNull();
    expect(parseSize("2 dozen")).toEqual({ qty: 2, unit: "dozen" });
  });
});

describe("audit regressions", () => {
  it.each([["4 litre", { qty: 4, unit: "L" }], ["650 millilitre", { qty: 0.65, unit: "L" }], ["1 kilogram", { qty: 1, unit: "kg" }], ["454 Gram", { qty: 0.454, unit: "kg" }], ["3 pounds", { qty: 1.36, unit: "kg" }]])("parses %s", (text, expected) => expect(parseSize(text)).toEqual(expected));
  it("rejects wrong spelled-out weight in a title", () => {
    const butter = ITEMS.filter((i) => i.id === "butter-salted-454g");
    expect(match("Salted Butter 454 Pound", "454 Gram", butter)).toBeNull();
  });
  it("distinguishes partly skimmed from skim milk", () => {
    expect(match("Neilson 2% Partly Skimmed Milk", "4 L")?.item.id).toBe("milk-2pct-4l");
    const skim = ITEMS.filter((i) => i.id === "milk-skim-4l");
    expect(match("Neilson 2% Partly Skimmed Milk", "4 L", skim)).toBeNull();
  });
  it.each(["Butter Tarts", "Butter Popcorn"])("rejects prepared food %s", (title) => expect(match(title, "454 g", ITEMS.filter((i) => i.id === "butter-salted-454g"))).toBeNull());
  it("rejects ice milk", () => expect(match("2% Ice Milk", "4 L")).toBeNull());
  it("reads count for count-based bakery products", () => {
    const bagels = ITEMS.filter((i) => i.id === "bagels-6");
    if (!bagels.length) throw new Error("missing bagel fixture");
    expect(match("Plain Bagels 6 pack", "6 un - 400g", bagels)?.item.id).toBe("bagels-6");
  });
});
