// FROZEN contract between DATA-01 (items/locations) and DATA-02 (generator).
import type { Item, RetailerId } from "../types";

export type SaleProfile = "rare" | "normal" | "perpetual";

export interface SeedItem {
  item: Item;
  /** target cross-store average package price in CAD (per kg for per-kg produce) */
  basePrice: number;
  /** produce with a seasonal price curve and higher noise */
  seasonal?: boolean;
  /** override the default "normal" sale behaviour per store */
  saleProfile?: Partial<Record<RetailerId, SaleProfile>>;
}
