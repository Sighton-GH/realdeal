// STUB (SPEC-00). BE-01 replaces; keep signatures.
import type { Item } from "../shared/types";
import type { RawProduct } from "./types";

export interface MatchResult { item: Item; product: RawProduct; score: number; reason: string }

/** Best matching product for an item, or null. `previousSizes` lets shrunk packages still match. */
export function matchProduct(item: Item, products: RawProduct[], previousSizes: number[] = []): MatchResult | null {
  void previousSizes;
  const p = products[0];
  return p ? { item, product: p, score: 0, reason: "stub" } : null;
}

/** Rank our items against free text (used by the Gemini scan). Best first. */
export function rankItems(items: Item[], text: string, sizeText?: string, limit = 3): Item[] {
  void sizeText;
  const t = text.toLowerCase();
  return items.filter((i) => [i.name, ...i.aliases].some((a) => t.includes(a.toLowerCase()))).slice(0, limit);
}
