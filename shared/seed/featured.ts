// DATA-04: the six featured flyer deals shown on the check home screen.
import type { FeaturedDeal, MultiBuy, PriceStore, RetailerId } from "../types";

interface FeaturedSpec {
  id: string;
  itemId: string;
  retailerId: RetailerId;
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  tagline: string;
}

const FEATURED: FeaturedSpec[] = [
  { id: "feat-butter", itemId: "butter-salted-454g", retailerId: "saveon", price: 5.99, wasPrice: 8.49, tagline: "Flyer says: save $2.50!" },
  { id: "feat-flour", itemId: "flour-ap-10kg", retailerId: "nofrills", price: 12.99, tagline: "Big bag, small price?" },
  { id: "feat-yogurt", itemId: "greek-yogurt-plain", retailerId: "walmart", price: 5.97, tagline: "Same price as always." },
  { id: "feat-pasta", itemId: "spaghetti-900g", retailerId: "tnt", price: 2.5, multiBuy: { qty: 2, total: 5 }, tagline: "2 for $5. Stock up?" },
  { id: "feat-berries", itemId: "strawberries-454g", retailerId: "saveon", price: 6.99, tagline: "Fresh this week." },
  { id: "feat-eggs", itemId: "eggs-large-12", retailerId: "walmart", price: 3.97, tagline: "Rollback on eggs." },
];

/** The six featured deals, in order. A deal whose item is missing from the store is skipped. */
export function getFeaturedDeals(store: PriceStore): FeaturedDeal[] {
  const deals: FeaturedDeal[] = [];
  for (const spec of FEATURED) {
    const item = store.items.find((i) => i.id === spec.itemId);
    if (!item) continue;
    const deal: FeaturedDeal = { id: spec.id, item, retailerId: spec.retailerId, price: spec.price, tagline: spec.tagline };
    if (spec.wasPrice !== undefined) deal.wasPrice = spec.wasPrice;
    if (spec.multiBuy) deal.multiBuy = spec.multiBuy;
    deals.push(deal);
  }
  return deals;
}
