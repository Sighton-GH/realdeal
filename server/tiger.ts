// STUB (SPEC-00). BE-09 replaces; keep the signatures. Used by server routes (BE-07). Everything must no-op without DATABASE_URL.
import type { PriceStore } from "../shared/types";

export const tigerEnabled = (): boolean => Boolean(process.env.DATABASE_URL);

/** Create schema if needed and upsert all points. Resolves (never throws) even on DB errors. */
export async function syncToTiger(store: PriceStore): Promise<void> {
  void store;
}

/** 90-day unit-price stats from the continuous aggregate, or null if unavailable. */
export async function getTigerStats(itemId: string): Promise<{ avgUnit90: number; lowUnit90: number; highUnit90: number } | null> {
  void itemId;
  return null;
}
