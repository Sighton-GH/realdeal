import { describe, expect, it } from "vitest";
import { migrateAppState } from "./useAppStore";

describe("migrateAppState", () => {
  it("drops hidden stores and recent checks that reference removed chains", () => {
    const ok = { checkId: "a", input: { retailerId: "saveon" }, best: { retailerId: "walmart" } };
    const oldInput = { checkId: "b", input: { retailerId: "metro" }, best: { retailerId: "saveon" } };
    const oldBest = { checkId: "c", input: { retailerId: "saveon" }, best: { retailerId: "voila" } };
    const out = migrateAppState({ hiddenStores: ["galleria", "tnt"], recentChecks: [ok, oldInput, oldBest], soundOn: false }, 1) as Record<string, unknown>;
    expect(out.hiddenStores).toEqual(["tnt"]);
    expect(out.recentChecks).toEqual([ok]);
    expect(out.soundOn).toBe(false);
  });
  it("passes through non-object state", () => {
    expect(migrateAppState(undefined, 1)).toBeUndefined();
  });
});
