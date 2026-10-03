import { describe, expect, it } from "vitest";
import type { Item } from "../shared/types";
import { matchProduct, rankItems } from "./match";
import type { RawProduct } from "./types";

const TEST_ITEMS: Item[] = [
  {
    id: "butter-salted-454g",
    name: "Salted butter",
    category: "dairy",
    sizeQty: 0.454,
    unit: "kg",
    sizeLabel: "454 g",
    artKey: "butter",
    aliases: ["butter", "salted butter", "butter brick"],
    searchQuery: "salted butter 454 g",
  },
  {
    id: "milk-2pct-4l",
    name: "2% milk",
    category: "dairy",
    sizeQty: 4,
    unit: "L",
    sizeLabel: "4 L",
    artKey: "milk",
    aliases: ["milk", "2% milk", "two percent milk"],
    searchQuery: "2% milk 4 l",
  },
  {
    id: "flour-ap-10kg",
    name: "All-purpose flour",
    category: "bakery",
    sizeQty: 10,
    unit: "kg",
    sizeLabel: "10 kg",
    artKey: "flour",
    aliases: ["flour", "all purpose flour", "ap flour"],
    searchQuery: "all purpose flour 10 kg",
  },
  {
    id: "greek-yogurt-plain",
    name: "Plain Greek yogurt",
    category: "dairy",
    sizeQty: 0.5,
    unit: "kg",
    sizeLabel: "500 g",
    artKey: "yogurt",
    aliases: ["greek yogurt", "plain yogurt", "plain greek yogurt"],
    searchQuery: "plain greek yogurt 500 g",
  },
  {
    id: "bananas-kg",
    name: "Bananas",
    category: "produce",
    sizeQty: 1,
    unit: "kg",
    sizeLabel: "per kg",
    artKey: "banana",
    aliases: ["bananas", "banana", "yellow bananas"],
    searchQuery: "bananas per kg",
  },
  {
    id: "eggs-large-12",
    name: "Large eggs",
    category: "dairy",
    sizeQty: 1,
    unit: "dozen",
    sizeLabel: "dozen",
    artKey: "eggs",
    aliases: ["eggs", "large eggs", "dozen eggs"],
    searchQuery: "large eggs 12",
  },
  {
    id: "spaghetti-900g",
    name: "Spaghetti",
    category: "pantry",
    sizeQty: 0.9,
    unit: "kg",
    sizeLabel: "900 g",
    artKey: "pasta",
    aliases: ["spaghetti", "pasta", "noodles"],
    searchQuery: "spaghetti 900 g",
  },
  {
    id: "penne-900g",
    name: "Penne",
    category: "pantry",
    sizeQty: 0.9,
    unit: "kg",
    sizeLabel: "900 g",
    artKey: "pasta",
    aliases: ["penne", "penne pasta"],
    searchQuery: "penne pasta 900 g",
  },
];

describe("matchProduct", () => {
  it("rejects butter vs unsalted butter", () => {
    const item = TEST_ITEMS.find((i) => i.id === "butter-salted-454g")!;
    const product: RawProduct = {
      title: "Unsalted Butter 454g",
      sizeText: "454 g",
      price: 6.99,
    };
    expect(matchProduct(item, [product])).toBeNull();
  });

  it("rejects 2% milk 4 L vs chocolate milk", () => {
    const item = TEST_ITEMS.find((i) => i.id === "milk-2pct-4l")!;
    const product: RawProduct = {
      title: "Chocolate Milk 4 L",
      sizeText: "4 L",
      price: 6.49,
    };
    expect(matchProduct(item, [product])).toBeNull();
  });

  it("rejects flour 10 kg vs 2.5 kg due to size mismatch", () => {
    const item = TEST_ITEMS.find((i) => i.id === "flour-ap-10kg")!;
    const product: RawProduct = {
      title: "All Purpose Flour 2.5 kg",
      sizeText: "2.5 kg",
      price: 6.49,
    };
    expect(matchProduct(item, [product])).toBeNull();
  });

  it("matches yogurt 500 g with previousSizes [0.65] (shrunk package)", () => {
    const item: Item = {
      ...TEST_ITEMS.find((i) => i.id === "greek-yogurt-plain")!,
      sizeQty: 0.65,
      sizeLabel: "650 g",
    };
    const product: RawProduct = {
      title: "Plain Greek Yogurt 500 g",
      sizeText: "500 g",
      price: 5.97,
    };
    const match = matchProduct(item, [product], [0.5]);
    expect(match).not.toBeNull();
    expect(match?.item.id).toBe("greek-yogurt-plain");
  });

  it("matches bananas priced per lb with normalisedPrice in reason", () => {
    const item = TEST_ITEMS.find((i) => i.id === "bananas-kg")!;
    const product: RawProduct = {
      title: "Fresh Bananas",
      sizeText: "per lb",
      price: 0.77,
      unitPriceText: "$0.77/lb",
    };
    const match = matchProduct(item, [product]);
    expect(match).not.toBeNull();
    expect(match?.reason).toContain("normalisedPrice=");
    expect(match?.reason).toContain("/kg");
  });

  it("matches eggs with '12 eggs' size format", () => {
    const item = TEST_ITEMS.find((i) => i.id === "eggs-large-12")!;
    const product: RawProduct = {
      title: "Large Grade A White Eggs",
      sizeText: "12 eggs",
      price: 4.49,
    };
    const match = matchProduct(item, [product]);
    expect(match).not.toBeNull();
  });

  it("rejects spaghetti vs penne", () => {
    const item = TEST_ITEMS.find((i) => i.id === "spaghetti-900g")!;
    const product: RawProduct = {
      title: "Penne Rigate 900 g",
      sizeText: "900 g",
      price: 2.5,
    };
    expect(matchProduct(item, [product])).toBeNull();
  });
});

describe("rankItems", () => {
  it("puts salted butter first for 'SALTED BUTTER 454G'", () => {
    const ranked = rankItems(TEST_ITEMS, "SALTED BUTTER 454G");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].id).toBe("butter-salted-454g");
  });
});
// --- Integration hardening: real catalogue items vs the wrong-but-similar products a store search returns.
import { SEED_ITEMS } from "../shared/seed/items";

const CATALOGUE = SEED_ITEMS.map((s) => s.item);
const catalogueItem = (id: string) => CATALOGUE.find((i) => i.id === id)!;

describe("catalogue matching: every item accepts its own listing", () => {
  for (const item of CATALOGUE) {
    it(`${item.id} matches '${item.name} ${item.sizeLabel}'`, () => {
      expect(matchProduct(item, [{ title: item.name, sizeText: item.sizeLabel, price: 5 }])).not.toBeNull();
    });
  }
  it("accepts a branded searchQuery-style title", () => {
    for (const item of CATALOGUE) {
      const p: RawProduct = { title: `Great Value ${item.searchQuery}`, brand: "Great Value", sizeText: item.sizeLabel, price: 5 };
      expect(matchProduct(item, [p]), item.id).not.toBeNull();
    }
  });
});

describe("catalogue matching: similar-but-different products are rejected", () => {
  const WRONG: Array<[string, string, string]> = [
    ["sugar-2kg", "Brown Sugar", "2 kg"], ["sugar-2kg", "Icing Sugar", "2 kg"],
    ["canola-oil-3l", "Olive Oil", "3 L"], ["canola-oil-3l", "Sunflower Oil", "3 L"],
    ["chicken-broth-900ml", "Beef Broth", "900 mL"], ["chicken-broth-900ml", "Vegetable Broth", "900 mL"],
    ["black-beans-540ml", "Kidney Beans", "540 mL"], ["black-beans-540ml", "Chickpeas", "540 mL"],
    ["tomatoes-canned-796ml", "Crushed Tomatoes", "796 mL"], ["tomatoes-canned-796ml", "Tomato Paste", "796 mL"],
    ["pasta-sauce-650ml", "Alfredo Sauce", "650 mL"], ["spaghetti-900g", "Farfalle Pasta", "900 g"],
    ["rice-long-8kg", "Sushi Rice", "8 kg"], ["rice-jasmine-8kg", "Long Grain Rice", "8 kg"],
    ["greek-yogurt-plain", "Plain Yogurt", "500 g"], ["yogurt-vanilla-650g", "Strawberry Yogurt", "650 g"],
    ["flour-ap-2-5kg", "Rice Flour", "2.5 kg"], ["flour-ww-2-5kg", "Rye Flour", "2.5 kg"],
    ["cheddar-old-400g", "Mild Cheddar", "400 g"], ["oats-1kg", "Instant Oats", "1 kg"],
    ["apples-gala-kg", "Granny Smith Apples", "per kg"], ["tomatoes-roma-kg", "Cherry Tomatoes", "per kg"],
    ["potatoes-russet-4-54kg", "Yellow Potatoes", "10 lb"], ["onions-yellow-1-36kg", "Red Onions", "3 lb"],
    ["cucumber-english", "Mini Cucumbers", "1 each"], ["milk-homo-2l", "Lactose Free Milk", "2 L"],
    ["bagels-6", "Everything Bagels", "6 pack"], ["eggs-large-12", "Medium Eggs", "12 pack"],
    ["sour-cream-500ml", "Cream Cheese", "500 mL"], ["cream-cheese-250g", "Sour Cream", "250 g"],
    ["peanut-butter-1kg", "Almond Butter", "1 kg"], ["butter-salted-454g", "Whipped Butter", "454 g"],
  ];
  for (const [id, title, sizeText] of WRONG) {
    it(`${id} rejects '${title}'`, () => {
      expect(matchProduct(catalogueItem(id), [{ title, sizeText, price: 5 }])).toBeNull();
    });
  }
  it("rejects a 2-pack of butter (size is multiplied)", () => {
    expect(matchProduct(catalogueItem("butter-salted-454g"), [{ title: "Salted Butter", sizeText: "2 x 454 g", price: 11 }])).toBeNull();
  });
});

describe("rankItems specificity", () => {
  it("puts roma tomatoes ahead of the bare 'tomatoes' alias on canned tomatoes", () => {
    expect(rankItems(CATALOGUE, "ROMA TOMATOES")[0].id).toBe("tomatoes-roma-kg");
  });
  it("ranks the scan text for the featured items first", () => {
    const want: Array<[string, string]> = [
      ["SALTED BUTTER 454G", "butter-salted-454g"], ["GREEK YOGURT PLAIN 500 G", "greek-yogurt-plain"],
      ["LARGE EGGS 12", "eggs-large-12"], ["SPAGHETTI 900G", "spaghetti-900g"],
      ["ALL PURPOSE FLOUR 10KG", "flour-ap-10kg"], ["2% MILK 4L", "milk-2pct-4l"],
      ["STRAWBERRIES 454 G", "strawberries-454g"], ["BANANAS", "bananas-kg"],
    ];
    for (const [text, id] of want) expect(rankItems(CATALOGUE, text)[0].id, text).toBe(id);
  });
});
