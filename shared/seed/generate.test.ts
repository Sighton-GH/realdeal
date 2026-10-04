import { describe, expect, it } from "vitest";
import { RETAILERS } from "../retailers";
import { DATA_END, WEEKS } from "./constants";
import { generateSeedStore, mondays } from "./generate";
import { hashString, mulberry32 } from "./rng";

describe("deterministic seed generator", () => {
  it("two calls produce identical output (deterministic)", () => {
    const storeA = generateSeedStore();
    const storeB = generateSeedStore();
    expect(storeA).toEqual(storeB);
  });

  it("mondays helper produces correct Monday dates ending at DATA_END", () => {
    const dates = mondays(DATA_END, WEEKS);
    expect(dates).toHaveLength(WEEKS);
    expect(dates[dates.length - 1]).toBe(DATA_END);

    for (const d of dates) {
      const day = new Date(d + "T00:00:00Z").getUTCDay();
      expect(day).toBe(1); // 1 = Monday
    }

    // Verify chronological order (oldest first)
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] > dates[i - 1]).toBe(true);
    }
  });

  it("every date is a Monday, dates end at DATA_END, and each item × store has exactly 26 chain points", () => {
    const store = generateSeedStore();
    const chainPoints = store.points.filter((p) => !p.storeId);

    for (const p of store.points) {
      const day = new Date(p.date + "T00:00:00Z").getUTCDay();
      expect(day).toBe(1);
    }

    for (const item of store.items) {
      for (const retailer of RETAILERS.filter((r) => ["saveon", "nofrills", "walmart", "tnt"].includes(r.id))) {
        const itemRetailerPoints = chainPoints.filter(
          (p) => p.itemId === item.id && p.retailerId === retailer.id,
        );
        expect(itemRetailerPoints).toHaveLength(26);
        expect(itemRetailerPoints[itemRetailerPoints.length - 1].date).toBe(
          DATA_END,
        );
      }
    }
  });

  it("no price has more than 2 decimals; all prices > 0", () => {
    const store = generateSeedStore();

    for (const p of store.points) {
      expect(p.price).toBeGreaterThan(0);
      expect(Number(p.price.toFixed(2))).toBe(p.price);

      if (p.regularPrice !== undefined) {
        expect(p.regularPrice).toBeGreaterThan(0);
        expect(Number(p.regularPrice.toFixed(2))).toBe(p.regularPrice);
      }

      if (p.wasPrice !== undefined) {
        expect(p.wasPrice).toBeGreaterThan(0);
        expect(Number(p.wasPrice.toFixed(2))).toBe(p.wasPrice);
      }
    }
  });

  it("point counts match expected catalogue formulas", () => {
    const store = generateSeedStore();
    const chainPoints = store.points.filter((p) => !p.storeId);
    const branchPoints = store.points.filter((p) => Boolean(p.storeId));

    expect(chainPoints).toHaveLength(store.items.length * 4 * 26);
    expect(branchPoints).toHaveLength(
      store.items.length * store.locations.length,
    );

    if (store.items.length === 40) {
      expect(chainPoints).toHaveLength(40 * 4 * 26);
      expect(branchPoints).toHaveLength(40 * store.locations.length);
    }
  });

  it("hero shape check: butter at saveon is on sale in exactly 10 of latest 12 weeks and priced 8.49 in exactly 4 of 26", () => {
    const store = generateSeedStore();
    const butterSaveon = store.points.filter(
      (p) =>
        !p.storeId &&
        p.itemId === "butter-salted-454g" &&
        p.retailerId === "saveon",
    );

    if (butterSaveon.length === 26) {
      const last12 = butterSaveon.slice(-12);
      const onSaleLast12 = last12.filter((p) => p.onSale);
      expect(onSaleLast12).toHaveLength(10);

      const priced849 = butterSaveon.filter((p) => p.price === 8.49);
      expect(priced849).toHaveLength(4);

      // Latest week is on sale at 5.99 with wasPrice 8.49
      const latest = butterSaveon[butterSaveon.length - 1];
      expect(latest.price).toBe(5.99);
      expect(latest.onSale).toBe(true);
      expect(latest.wasPrice).toBe(8.49);
      expect(latest.regularPrice).toBe(8.49);
    }
  });

  it("hero shape check: yogurt at walmart has 0.5 kg in last 8 weeks and 0.65 before (if item present)", () => {
    const store = generateSeedStore();
    const yogurtWalmart = store.points.filter(
      (p) =>
        !p.storeId &&
        p.itemId === "greek-yogurt-plain" &&
        p.retailerId === "walmart",
    );

    if (yogurtWalmart.length === 26) {
      const last8 = yogurtWalmart.slice(-8);
      const first18 = yogurtWalmart.slice(0, 18);
      expect(last8.every((p) => p.sizeQty === 0.5)).toBe(true);
      expect(first18.every((p) => p.sizeQty === 0.65)).toBe(true);
    }
  });

  it("hero shape check: spaghetti at tnt has multiBuy { qty: 2, total: 5 } in exactly the latest 3 weeks (if item present)", () => {
    const store = generateSeedStore();
    const spaghettiTnt = store.points.filter(
      (p) =>
        !p.storeId &&
        p.itemId === "spaghetti-900g" &&
        p.retailerId === "tnt",
    );

    if (spaghettiTnt.length === 26) {
      const last3 = spaghettiTnt.slice(-3);
      const first23 = spaghettiTnt.slice(0, 23);
      expect(
        last3.every(
          (p) => p.multiBuy?.qty === 2 && p.multiBuy?.total === 5.0,
        ),
      ).toBe(true);
      expect(first23.every((p) => p.multiBuy === undefined)).toBe(true);
    }
  });

  it("hero stores outside the story still move week to week (no flat-line charts)", () => {
    const store = generateSeedStore();
    const distinct = (itemId: string, retailerId: string) =>
      new Set(store.points.filter((p) => !p.storeId && p.itemId === itemId && p.retailerId === retailerId).map((p) => p.price)).size;
    expect(distinct("eggs-large-12", "saveon")).toBeGreaterThan(2);
    expect(distinct("flour-ap-10kg", "walmart")).toBeGreaterThan(2);
    expect(distinct("greek-yogurt-plain", "nofrills")).toBeGreaterThan(2);
    // story prices stay pinned
    expect(distinct("eggs-large-12", "walmart")).toBe(1);
    expect(distinct("spaghetti-900g", "tnt")).toBe(1);
  });

  it("RNG functions: mulberry32 and hashString are deterministic", () => {
    const h1 = hashString("butter-salted-454gsaveon");
    const h2 = hashString("butter-salted-454gsaveon");
    expect(h1).toBe(h2);

    const r1 = mulberry32(h1);
    const r2 = mulberry32(h2);
    const seq1 = [r1(), r1(), r1(), r1()];
    const seq2 = [r2(), r2(), r2(), r2()];
    expect(seq1).toEqual(seq2);
    for (const val of seq1) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});