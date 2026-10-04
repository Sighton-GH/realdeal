import { describe, expect, it } from "vitest";
import { ITEMS } from "../shared/seed/items";
import { matchWithOverrides } from "./hammer-overrides";
const raw = { title: "2% Milk 2 L", price: 4 };
describe("audited overrides", () => {
  it("exclusions win over assignments", () => expect(matchWithOverrides(ITEMS, raw, "id", { excludeProductIds: ["id"], assignments: { id: "milk-2pct-2l" } })).toBeNull());
  it("assignments require size proof", () => expect(matchWithOverrides(ITEMS, raw, "id", { assignments: { id: "milk-2pct-4l" } })).toBeNull());
  it("does not fall back when an assignment is invalid", () => expect(matchWithOverrides(ITEMS, raw, "id", { assignments: { id: "missing-item" } })).toBeNull());
  it("valid assignments keep exact IDs including slash/plus/equal", () => expect(matchWithOverrides(ITEMS, raw, "x/y+z==", { assignments: { "x/y+z==": "milk-2pct-2l" } })?.item.id).toBe("milk-2pct-2l"));
});
