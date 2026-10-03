// SPEC-00 smoke tests for the frozen helpers. DATA-03 adds shared/verdict.test.ts.
import { describe, expect, it } from "vitest";
import { distanceKm, tierFor, unitPriceOf } from "./verdict";

describe("foundation helpers", () => {
  it("tierFor thresholds", () => {
    expect(tierFor(-0.3)).toBe("steal");
    expect(tierFor(-0.25)).toBe("steal");
    expect(tierFor(-0.2499)).toBe("good");
    expect(tierFor(-0.1)).toBe("good");
    expect(tierFor(-0.0999)).toBe("normal");
    expect(tierFor(0.1)).toBe("normal");
    expect(tierFor(0.1001)).toBe("high");
  });
  it("unitPriceOf handles multi-buy", () => {
    expect(unitPriceOf(5, 0.9, { qty: 2, total: 5 })).toBeCloseTo(2.5 / 0.9);
  });
  it("distanceKm SFU Burnaby to downtown Vancouver", () => {
    expect(distanceKm({ lat: 49.2781, lng: -122.9199 }, { lat: 49.2827, lng: -123.1207 })).toBeCloseTo(14.6, 0);
  });
});
