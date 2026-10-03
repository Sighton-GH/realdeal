// DATA-04: end-to-end story tests. Integration check between DATA-01 (items), DATA-02 (generator) and DATA-03 (engine).
import { describe, expect, it } from "vitest";
import type { FeaturedDeal, PriceCheckInput, TrickType, VerdictTier } from "./types";
import { checkPrice, generateSeedStore } from "./verdict";
import { getFeaturedDeals } from "./seed/featured";

const store = generateSeedStore();
const deals = new Map<string, FeaturedDeal>(getFeaturedDeals(store).map((d) => [d.id, d]));

interface Story {
  id: string;
  tier: VerdictTier;
  tricks: TrickType[];
}

const STORIES: Story[] = [
  { id: "feat-butter", tier: "normal", tricks: ["perpetual_sale", "inflated_was_price"] },
  { id: "feat-flour", tier: "steal", tricks: [] },
  { id: "feat-yogurt", tier: "high", tricks: ["shrinkflation"] },
  { id: "feat-pasta", tier: "normal", tricks: ["multibuy_trap"] },
  { id: "feat-berries", tier: "high", tricks: [] },
  { id: "feat-eggs", tier: "good", tricks: [] },
];

function inputFor(deal: FeaturedDeal): PriceCheckInput {
  const input: PriceCheckInput = { itemId: deal.item.id, retailerId: deal.retailerId, price: deal.price, source: "flyer" };
  if (deal.wasPrice !== undefined) input.wasPrice = deal.wasPrice;
  if (deal.multiBuy) input.multiBuy = deal.multiBuy;
  if (deal.sizeQty !== undefined) input.sizeQty = deal.sizeQty;
  return input;
}

describe("featured deals", () => {
  it("returns deals in the specified order", () => {
    const order = getFeaturedDeals(store).map((d) => d.id);
    const expected = STORIES.map((s) => s.id).filter((id) => deals.has(id));
    expect(order).toEqual(expected);
  });
});

describe("story tests", () => {
  for (const story of STORIES) {
    it.skipIf(!deals.has(story.id))(`${story.id}: ${story.tier}, tricks [${story.tricks.join(", ")}]`, () => {
      const deal = deals.get(story.id);
      if (!deal) throw new Error(`Missing deal ${story.id}`);
      const verdict = checkPrice(store, inputFor(deal));
      expect(verdict.tier).toBe(story.tier);
      expect(verdict.tricks.map((t) => t.type).sort()).toEqual([...story.tricks].sort());
    });
  }
});
