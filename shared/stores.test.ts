import { describe, expect, it } from "vitest";
import { generateSeedStore } from "./seed/generate";
import { getStoreItems, getStoreSummaries } from "./stores";

describe("store summaries", () => {
  const store = generateSeedStore();

  it("lists every retailer and counts seed-only stores as sample data", () => {
    const summaries = getStoreSummaries(store);
    expect(summaries.map((s) => s.retailerId)).toEqual(["saveon", "nofrills", "walmart", "tnt", "loblaws", "metro", "voila", "galleria"]);
    const saveon = summaries.find((s) => s.retailerId === "saveon")!;
    expect(saveon.itemCount).toBe(store.items.length);
    expect(saveon.realItemCount).toBe(0);
    expect(summaries.find((s) => s.retailerId === "metro")!.itemCount).toBe(0);
  });

  it("returns one latest row per item", () => {
    const rows = getStoreItems(store, "walmart");
    expect(rows).toHaveLength(store.items.length);
    expect(new Set(rows.map((r) => r.item.id)).size).toBe(rows.length);
  });
});
