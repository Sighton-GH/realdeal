// PLACEHOLDER (SPEC-00). DATA-04 replaces with the six featured deals; keep the export.
import type { FeaturedDeal, PriceStore } from "../types";

export function getFeaturedDeals(store: PriceStore): FeaturedDeal[] {
  const find = (id: string) => store.items.find((i) => i.id === id)!;
  return [
    { id: "feat-butter", item: find("butter-salted-454g"), retailerId: "saveon", price: 5.99, wasPrice: 8.49, tagline: "Flyer says: save $2.50!" },
    { id: "feat-flour", item: find("flour-ap-10kg"), retailerId: "nofrills", price: 12.99, tagline: "Big bag, small price?" },
  ];
}
