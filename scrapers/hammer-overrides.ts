import type { Item } from "../shared/types";
import { matchHammerProduct } from "./hammer-match";
import type { RawProduct } from "./types";

export interface HammerOverrides {
  excludeProductIds?: string[];
  assignments?: Record<string, string>;
  notes?: string[];
}
export function matchWithOverrides(items: Item[], product: RawProduct, productId: string, overrides: HammerOverrides = {}) {
  if (overrides.excludeProductIds?.includes(productId)) return null;
  const assigned = overrides.assignments?.[productId];
  return matchHammerProduct(assigned ? items.filter((i) => i.id === assigned) : items, product);
}
