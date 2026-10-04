import type { Item } from "@shared/types";
import type { PriceDisplay } from "@/store/useAppStore";

/** Price input stays in shelf/package units. Only the displayed amount changes. */
export function displayedPrice(packagePrice: number, unitPrice: number, item: Item, mode: PriceDisplay) {
  const loose = item.unit === "kg" && item.sizeLabel === "per kg";
  return mode === "unit" || loose
    ? { amount: unitPrice, unit: item.unit }
    : { amount: packagePrice, unit: undefined };
}
