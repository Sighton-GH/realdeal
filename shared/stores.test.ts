import { SEED_ITEMS } from "./seed/items";
import { describe, expect, it } from "vitest";
import { generateSeedStore } from "./seed/generate";
import { RETAILERS } from "./retailers";
import { dropUnknownRetailers, getStoreItems, getStoreSummaries } from "./stores";
import type { RetailerId } from "./types";

describe("store summaries", () => {
  const store = generateSeedStore();

  it("lists every retailer and counts seed-only stores as sample data", () => {
    const summaries = getStoreSummaries(store);
    expect(summaries.map((s) => s.retailerId)).toEqual(["saveon", "nofrills", "walmart", "tnt", "loblaws"]);
    const saveon = summaries.find((s) => s.retailerId === "saveon")!;
    expect(saveon.itemCount).toBe(SEED_ITEMS.length);
    expect(saveon.realItemCount).toBe(0);
    expect(summaries).toHaveLength(RETAILERS.length);
  });

  it("returns one latest row per item", () => {
    const rows = getStoreItems(store, "walmart");
    expect(rows).toHaveLength(SEED_ITEMS.length);
    expect(new Set(rows.map((r) => r.item.id)).size).toBe(rows.length);
  });
});

describe("dropUnknownRetailers", () => {
  it("removes points and locations for chains that are not in RETAILERS", () => {
    const base = generateSeedStore();
    const stale = {
      ...base,
      points: [...base.points, { ...base.points[0], retailerId: "metro" as unknown as RetailerId }],
      locations: [...base.locations, { ...base.locations[0], id: "metro-1", retailerId: "galleria" as unknown as RetailerId }],
    };
    const clean = dropUnknownRetailers(stale);
    expect(clean.points).toHaveLength(base.points.length);
    expect(clean.locations).toHaveLength(base.locations.length);
    expect(clean.items).toBe(base.items);
  });
});
