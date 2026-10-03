// PLACEHOLDER (SPEC-00). DATA-01 replaces with all 40 items; keep the exports.
import type { Item } from "../types";
import type { SeedItem } from "./types";

export const SEED_ITEMS: SeedItem[] = [
  { item: { id: "butter-salted-454g", name: "Salted butter", category: "dairy", sizeQty: 0.454, unit: "kg", sizeLabel: "454 g", artKey: "butter", aliases: ["butter"], searchQuery: "salted butter 454 g" }, basePrice: 6.1 },
  { item: { id: "flour-ap-10kg", name: "All-purpose flour", category: "bakery", sizeQty: 10, unit: "kg", sizeLabel: "10 kg", artKey: "flour", aliases: ["flour"], searchQuery: "all purpose flour 10 kg" }, basePrice: 18.5 },
  { item: { id: "eggs-large-12", name: "Large eggs", category: "dairy", sizeQty: 1, unit: "dozen", sizeLabel: "dozen", artKey: "eggs", aliases: ["eggs"], searchQuery: "large eggs 12" }, basePrice: 4.6 },
];

export const ITEMS: Item[] = SEED_ITEMS.map((s) => s.item);
