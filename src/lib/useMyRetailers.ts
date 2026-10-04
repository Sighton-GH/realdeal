import { RETAILERS } from "@shared/retailers";
import { useAppStore } from "@/store/useAppStore";

/** Retailers to offer in store pickers: everything except the stores hidden in Settings (never empty). */
export function useMyRetailers() {
  const hidden = useAppStore((s) => s.hiddenStores);
  const mine = RETAILERS.filter((r) => !hidden.includes(r.id));
  return mine.length > 0 ? mine : RETAILERS;
}
