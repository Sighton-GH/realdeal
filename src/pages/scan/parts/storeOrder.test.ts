import { describe, expect, it } from "vitest";
import { RETAILERS } from "@shared/retailers";
import type { NearbyStorePrice, StoreLocation } from "@shared/types";
import { orderRetailers } from "./storeOrder";

const near = (retailerId: StoreLocation["retailerId"], distanceKm: number): NearbyStorePrice => ({
  store: { id: `${retailerId}-${distanceKm}`, retailerId, name: `${retailerId} branch`, address: "", lat: 0, lng: 0 },
  distanceKm, price: 1, unitPrice: 1, onSale: false, tier: "normal", priceScope: "chain", live: false, date: "2026-01-05",
});

describe("orderRetailers", () => {
  it("orders chains by their nearest branch, then the rest in RETAILERS order", () => {
    const { ordered, atStore } = orderRetailers(RETAILERS, [near("tnt", 1.2), near("walmart", 2), near("tnt", 3)]);
    expect(ordered.map((r) => r.id)).toEqual(["tnt", "walmart", "saveon", "nofrills", "loblaws"]);
    expect(atStore).toBeUndefined();
  });
  it("reports the branch the user is standing in (within 300 m)", () => {
    const { atStore } = orderRetailers(RETAILERS, [near("saveon", 0.12)]);
    expect(atStore?.retailerId).toBe("saveon");
  });
  it("only offers the user's own stores", () => {
    const mine = RETAILERS.filter((r) => r.id !== "tnt");
    const { ordered, atStore } = orderRetailers(mine, [near("tnt", 0.1)]);
    expect(ordered.map((r) => r.id)).not.toContain("tnt");
    expect(atStore).toBeUndefined();
  });
});
