import type { TrickInfo } from "../types";

export const TRICKS: TrickInfo[] = [
  {
    type: "perpetual_sale",
    name: "Forever sale",
    oneLiner: "If it's on sale most weeks, the sale price is just the price.",
    howItWorks:
      "Stores set a high \"regular\" price they rarely charge, then run the item \"on sale\" almost every week. The sale tag creates urgency for a price that's actually normal.",
    howWeCatch:
      "We count how many of the last 12 weeks the item was on sale at that store. Six or more and we call it out.",
    exampleItemId: "butter-salted-454g",
    exampleRetailerId: "saveon",
  },
  {
    type: "inflated_was_price",
    name: "Inflated \"was\" price",
    oneLiner: "A struck-out price nobody actually paid.",
    howItWorks:
      "The \"was\" price makes the discount look big. If the item almost never sold at that price, the saving is imaginary.",
    howWeCatch:
      "We check how often the item really sold at the \"was\" price in the last 26 weeks. Under a quarter of the time and we flag it, then show your real saving against the average.",
    exampleItemId: "butter-salted-454g",
    exampleRetailerId: "saveon",
  },
  {
    type: "multibuy_trap",
    name: "Multi-buy trap",
    oneLiner: "Buy two, save almost nothing.",
    howItWorks:
      "\"2 for $5\" sounds like a deal and gets you to buy more. Often the single price is only a few cents higher, or even the same.",
    howWeCatch:
      "We compare the per-item multi-buy price with that store's usual single price. A saving under 5% gets flagged.",
    exampleItemId: "spaghetti-900g",
    exampleRetailerId: "tnt",
  },
  {
    type: "shrinkflation",
    name: "Shrinkflation",
    oneLiner: "Same price, less food.",
    howItWorks:
      "The package gets smaller while the price stays put, so you pay more per gram without noticing.",
    howWeCatch:
      "We track package sizes week by week. If the package shrank 5% or more and the price per kg or litre went up, we flag it.",
    exampleItemId: "greek-yogurt-plain",
    exampleRetailerId: "walmart",
  },
];
