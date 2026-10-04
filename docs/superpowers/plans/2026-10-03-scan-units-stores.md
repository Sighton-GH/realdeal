# Scan units, store choice, confirm layout, tap to focus — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scanned prices use the unit printed on the tag (per lb, 454 g, …) and convert to the catalogue unit for the verdict; the confirm sheet shows product → tag price and amount → store (GPS-ordered, with "Other"); Metro/Voila/Galleria are removed; the camera gets tap to focus and expose; the results page drops Replay and shows prices in the tag's unit.

**Architecture:** A new pure module `shared/units.ts` owns tag amounts and conversions. The server scan returns `tagAmount`; the client converts it to `sizeQty` (item units) for the existing engine and carries `tagAmount` in `PriceCheckInput` for display. "Other" store = `PriceCheckInput.retailerId` absent.

**Tech Stack:** Vite + React 19 + TypeScript strict, Tailwind v4 tokens, motion/react, @phosphor-icons/react, zustand, @tanstack/react-query, vitest, Hono server.

**Spec:** `docs/superpowers/specs/2026-10-03-scan-units-stores-design.md`

## Global Constraints

- Do not add or install dependencies. Do not create `tailwind.config.js`. Do not edit `package.json`, `src/styles/theme.css`, `src/App.tsx`, `src/routes.tsx`.
- `shared/types.ts` may be edited ONLY where a task says so (this plan is the approved contract change).
- Read `DESIGN.md` (especially section 11, "Never do this") before any UI task.
- Colours, radii, fonts from Tailwind token classes only; no raw hex in components.
- Use shared components from `@/components/ui`, `@/components/domain`, etc. Do not build your own buttons, cards, badges.
- Icons: `@phosphor-icons/react` only (weight `bold`, `fill` for selected). Motion: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`; respect reduced motion.
- TypeScript strict: no `any`, no `@ts-ignore`, no `console.log` left behind.
- Copy: sentence case, Canadian spelling. Money via `src/lib/format.ts` (`formatMoney`).
- Touch targets at least 48px (`min-h-12`). Visible focus rings per DESIGN.md. `aria-label` on icon-only buttons.
- Data only through `api` from `@/api/client` in UI code (never import `mock.ts`).
- Verification for every task: `npm run typecheck && npm run lint && npm run test` must pass.

## Review Focus

1. A price-unit string that contains the price itself ("$1.27 lb", "lb/ $2.81 kg") must still read as 1 lb — Task 1 test `parseTagAmount strips money`.
2. A tag amount whose unit cannot convert to the matched item (e.g. "per L" on a kg item) must be ignored, not crash or mis-convert — Task 1 `amountForItem` test and Task 4 `incompatible unit` test.
3. Persisted recent checks or hidden stores from before the change that reference Metro/Voila/Galleria must not crash the app — Task 2 `migrateAppState` test.
4. A check with "Other" store must never call `retailerById(undefined)`; when the user's price is cheapest, `best.retailerId` is undefined — Task 3 verdict tests.
5. A stale `data/prices.json` still containing points for removed chains must not leak them — Task 2 `dropUnknownRetailers` test.

---

### Task 1: Tag units module

**Files:**
- Modify: `shared/types.ts` (add two types only)
- Create: `shared/units.ts`
- Test: `shared/units.test.ts`

**Interfaces:**
- Produces (used by tasks 3–6):
  - `type TagUnit = "g" | "kg" | "lb" | "oz" | "mL" | "L" | "each" | "dozen"` and `interface TagAmount { qty: number; unit: TagUnit }` exported from `shared/types.ts`
  - `toItemUnits(a: TagAmount, itemUnit: Unit): number | undefined`
  - `compatibleUnits(itemUnit: Unit): TagUnit[]`
  - `fromItemUnits(qty: number, itemUnit: Unit): TagAmount`
  - `formatTagAmount(a: TagAmount): string`
  - `parseTagAmount(text: string | null | undefined): TagAmount | undefined`
  - `amountForItem(a: TagAmount | undefined, item: Item): { amount: TagAmount; fromTag: boolean }`
  - `sameAmount(a: TagAmount, b: TagAmount, itemUnit: Unit, tolerance = 0.03): boolean`
  - `LB_KG = 0.45359237`

- [ ] **Step 1: Add the types to `shared/types.ts`** directly after the `export type Unit = ...` line:

```ts
/** A unit as printed on a shelf tag. Converted to the item's Unit with shared/units.ts. */
export type TagUnit = "g" | "kg" | "lb" | "oz" | "mL" | "L" | "each" | "dozen";
/** The amount a printed price is for: { qty: 1, unit: "lb" } for "$1.27 /lb", { qty: 454, unit: "g" } for a 454 g pack. */
export interface TagAmount { qty: number; unit: TagUnit }
```

- [ ] **Step 2: Write the failing tests** in `shared/units.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Item } from "./types";
import { amountForItem, compatibleUnits, formatTagAmount, fromItemUnits, LB_KG, parseTagAmount, sameAmount, toItemUnits } from "./units";

const item = (unit: Item["unit"], sizeQty: number): Item => ({
  id: "x", name: "X", category: "produce", sizeQty, unit, sizeLabel: "", artKey: "generic", aliases: [], searchQuery: "x",
});

describe("toItemUnits", () => {
  it("converts weights to kg", () => {
    expect(toItemUnits({ qty: 1, unit: "lb" }, "kg")).toBeCloseTo(0.45359237, 8);
    expect(toItemUnits({ qty: 454, unit: "g" }, "kg")).toBeCloseTo(0.454, 8);
    expect(toItemUnits({ qty: 16, unit: "oz" }, "kg")).toBeCloseTo(0.45359237, 6);
    expect(toItemUnits({ qty: 2, unit: "kg" }, "kg")).toBe(2);
  });
  it("converts volumes to L and counts both ways", () => {
    expect(toItemUnits({ qty: 500, unit: "mL" }, "L")).toBeCloseTo(0.5, 8);
    expect(toItemUnits({ qty: 12, unit: "each" }, "dozen")).toBeCloseTo(1, 8);
    expect(toItemUnits({ qty: 1, unit: "dozen" }, "each")).toBe(12);
  });
  it("returns undefined for units that do not convert or a non-positive qty", () => {
    expect(toItemUnits({ qty: 1, unit: "lb" }, "L")).toBeUndefined();
    expect(toItemUnits({ qty: 1, unit: "L" }, "kg")).toBeUndefined();
    expect(toItemUnits({ qty: 0, unit: "kg" }, "kg")).toBeUndefined();
  });
});

describe("compatibleUnits", () => {
  it("lists the tag units for each item unit", () => {
    expect(compatibleUnits("kg")).toEqual(["g", "kg", "lb", "oz"]);
    expect(compatibleUnits("L")).toEqual(["mL", "L"]);
    expect(compatibleUnits("each")).toEqual(["each", "dozen"]);
    expect(compatibleUnits("dozen")).toEqual(["dozen", "each"]);
  });
});

describe("fromItemUnits", () => {
  it("uses g / mL below 1 kg / 1 L", () => {
    expect(fromItemUnits(0.454, "kg")).toEqual({ qty: 454, unit: "g" });
    expect(fromItemUnits(1, "kg")).toEqual({ qty: 1, unit: "kg" });
    expect(fromItemUnits(0.5, "L")).toEqual({ qty: 500, unit: "mL" });
    expect(fromItemUnits(4, "L")).toEqual({ qty: 4, unit: "L" });
    expect(fromItemUnits(6, "each")).toEqual({ qty: 6, unit: "each" });
    expect(fromItemUnits(1, "dozen")).toEqual({ qty: 1, unit: "dozen" });
  });
});

describe("formatTagAmount", () => {
  it("says per for one unit and for otherwise", () => {
    expect(formatTagAmount({ qty: 1, unit: "lb" })).toBe("per lb");
    expect(formatTagAmount({ qty: 1, unit: "kg" })).toBe("per kg");
    expect(formatTagAmount({ qty: 1, unit: "each" })).toBe("each");
    expect(formatTagAmount({ qty: 1, unit: "dozen" })).toBe("per dozen");
    expect(formatTagAmount({ qty: 454, unit: "g" })).toBe("for 454 g");
    expect(formatTagAmount({ qty: 1.89, unit: "L" })).toBe("for 1.89 L");
    expect(formatTagAmount({ qty: 12, unit: "each" })).toBe("for 12 pack");
    expect(formatTagAmount({ qty: 100, unit: "g" })).toBe("for 100 g");
  });
});

describe("parseTagAmount", () => {
  it("reads bare and slashed units as one unit", () => {
    expect(parseTagAmount("lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("/lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("per lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("/KG")).toEqual({ qty: 1, unit: "kg" });
    expect(parseTagAmount("ea")).toEqual({ qty: 1, unit: "each" });
    expect(parseTagAmount("dozen")).toEqual({ qty: 1, unit: "dozen" });
  });
  it("reads quantities", () => {
    expect(parseTagAmount("454 g")).toEqual({ qty: 454, unit: "g" });
    expect(parseTagAmount("/100g")).toEqual({ qty: 100, unit: "g" });
    expect(parseTagAmount("1.89 L")).toEqual({ qty: 1.89, unit: "L" });
    expect(parseTagAmount("500 mL")).toEqual({ qty: 500, unit: "mL" });
    expect(parseTagAmount("12 pack")).toEqual({ qty: 12, unit: "each" });
    expect(parseTagAmount("1,5 kg")).toEqual({ qty: 1.5, unit: "kg" });
    expect(parseTagAmount("2 x 454 g")).toEqual({ qty: 908, unit: "g" });
  });
  it("strips money so a price is never read as a quantity", () => {
    expect(parseTagAmount("$1.27 lb")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("lb/ $2.81 kg")).toEqual({ qty: 1, unit: "lb" });
    expect(parseTagAmount("$11.94 / KG")).toEqual({ qty: 1, unit: "kg" });
  });
  it("returns undefined when there is no unit", () => {
    expect(parseTagAmount("")).toBeUndefined();
    expect(parseTagAmount(null)).toBeUndefined();
    expect(parseTagAmount("Banana Plantain")).toBeUndefined();
    expect(parseTagAmount("$5.99")).toBeUndefined();
  });
});

describe("amountForItem", () => {
  it("keeps a compatible tag amount", () => {
    expect(amountForItem({ qty: 1, unit: "lb" }, item("kg", 1))).toEqual({ amount: { qty: 1, unit: "lb" }, fromTag: true });
  });
  it("falls back to the catalogue size when missing or incompatible", () => {
    expect(amountForItem(undefined, item("kg", 0.454))).toEqual({ amount: { qty: 454, unit: "g" }, fromTag: false });
    expect(amountForItem({ qty: 1, unit: "L" }, item("kg", 1))).toEqual({ amount: { qty: 1, unit: "kg" }, fromTag: false });
  });
});

describe("sameAmount", () => {
  it("compares in item units within a tolerance", () => {
    expect(sameAmount({ qty: 454, unit: "g" }, { qty: 1, unit: "lb" }, "kg")).toBe(true);
    expect(sameAmount({ qty: 1, unit: "kg" }, { qty: 1, unit: "lb" }, "kg")).toBe(false);
    expect(LB_KG).toBe(0.45359237);
  });
});
```

- [ ] **Step 3: Run to see it fail:** `npx vitest run shared/units.test.ts` → FAIL (module not found).

- [ ] **Step 4: Implement `shared/units.ts`:**

```ts
import type { Item, TagAmount, TagUnit, Unit } from "./types";

export const LB_KG = 0.45359237;
const OZ_KG = 0.028349523125;

/** How many item units one tag unit is. Key order is the order compatibleUnits returns. */
const FACTORS: Record<Unit, Partial<Record<TagUnit, number>>> = {
  kg: { g: 0.001, kg: 1, lb: LB_KG, oz: OZ_KG },
  L: { mL: 0.001, L: 1 },
  each: { each: 1, dozen: 12 },
  dozen: { dozen: 1, each: 1 / 12 },
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The tag amount in the item's unit (1 lb -> 0.4536 kg), or undefined when the units don't convert. */
export function toItemUnits(a: TagAmount, itemUnit: Unit): number | undefined {
  const f = FACTORS[itemUnit][a.unit];
  if (f === undefined || !(a.qty > 0)) return undefined;
  return a.qty * f;
}

export function compatibleUnits(itemUnit: Unit): TagUnit[] {
  return Object.keys(FACTORS[itemUnit]) as TagUnit[];
}

/** The catalogue size written the way a tag would print it: 0.454 kg -> 454 g. */
export function fromItemUnits(qty: number, itemUnit: Unit): TagAmount {
  switch (itemUnit) {
    case "kg": return qty < 1 ? { qty: Math.round(qty * 1000), unit: "g" } : { qty: round2(qty), unit: "kg" };
    case "L": return qty < 1 ? { qty: Math.round(qty * 1000), unit: "mL" } : { qty: round2(qty), unit: "L" };
    case "each": return { qty: round2(qty), unit: "each" };
    case "dozen": return { qty: round2(qty), unit: "dozen" };
  }
}

/** "per lb", "each", "for 454 g", "for 12 pack". */
export function formatTagAmount(a: TagAmount): string {
  if (a.qty === 1) return a.unit === "each" ? "each" : `per ${a.unit}`;
  return `for ${round2(a.qty)} ${a.unit === "each" ? "pack" : a.unit}`;
}

const UNIT_WORDS: Array<[RegExp, TagUnit]> = [
  [/^(?:kg|kgs|kilos?|kilograms?)$/, "kg"],
  [/^(?:g|gr|grams?)$/, "g"],
  [/^(?:lb|lbs|pounds?)$/, "lb"],
  [/^(?:oz|ounces?)$/, "oz"],
  [/^(?:ml|millilit(?:re|er)s?)$/, "mL"],
  [/^(?:l|lit(?:re|er)s?)$/, "L"],
  [/^(?:ea|each|pk|pack|ct|count|pcs?)$/, "each"],
  [/^(?:dozen|doz)$/, "dozen"],
];

function unitOf(word: string): TagUnit | undefined {
  return UNIT_WORDS.find(([re]) => re.test(word))?.[1];
}

/** Reads the first amount in tag text. Money ("$2.81") is removed first so a price is never read as a quantity. */
export function parseTagAmount(text: string | null | undefined): TagAmount | undefined {
  if (!text) return undefined;
  const t = text.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").replace(/\$\s*\d+(?:\.\d+)?/g, " ");

  const multi = t.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([a-z]+)/);
  if (multi) {
    const unit = unitOf(multi[3]);
    if (unit) return { qty: round2(Number(multi[1]) * Number(multi[2])), unit };
  }

  for (const m of t.matchAll(/(\d+(?:\.\d+)?)?\s*([a-z]+)/g)) {
    const unit = unitOf(m[2]);
    if (unit) return { qty: m[1] ? Number(m[1]) : 1, unit };
  }
  return undefined;
}

/** The tag amount when it fits the item, else the item's catalogue size. */
export function amountForItem(a: TagAmount | undefined, item: Item): { amount: TagAmount; fromTag: boolean } {
  if (a && toItemUnits(a, item.unit) !== undefined) return { amount: a, fromTag: true };
  return { amount: fromItemUnits(item.sizeQty, item.unit), fromTag: false };
}

/** True when both amounts are within `tolerance` of each other in the item's unit. */
export function sameAmount(a: TagAmount, b: TagAmount, itemUnit: Unit, tolerance = 0.03): boolean {
  const x = toItemUnits(a, itemUnit);
  const y = toItemUnits(b, itemUnit);
  if (x === undefined || y === undefined) return false;
  return Math.abs(x - y) / Math.max(x, y) <= tolerance;
}
```

- [ ] **Step 5: Run** `npx vitest run shared/units.test.ts` → PASS, then `npm run typecheck && npm run lint && npm run test`.

- [ ] **Step 6: Commit** `git add shared/types.ts shared/units.ts shared/units.test.ts && git commit -m "Add tag units module"`

---

### Task 2: Remove Metro, Voila and Galleria

**Files:**
- Modify: `shared/types.ts` (the `RetailerId` line only), `shared/retailers.ts`, `shared/stores.ts`, `shared/stores.test.ts`, `scrapers/import-hammer.ts`, `server/scan.ts` (`mapRetailer` only), `server/scan.test.ts` (the store-name mapping table only), `server/data.ts`, `src/api/mock.ts`, `src/store/useAppStore.ts`, `scrapers/adapters/index.ts` (comment only), `src/lib/priceDisplay.test.ts` (the eight-stores tile test only)
- Create: `src/store/useAppStore.test.ts`

**Interfaces:**
- Produces: `dropUnknownRetailers(store: PriceStore): PriceStore` in `shared/stores.ts`; `migrateAppState(persisted: unknown, version: number): unknown` exported from `src/store/useAppStore.ts`.

- [ ] **Step 1:** `shared/types.ts`: `export type RetailerId = "saveon" | "nofrills" | "walmart" | "tnt" | "loblaws";`. `shared/retailers.ts`: delete the metro, voila and galleria entries. Leave the theme tokens and `TileColour` alone.

- [ ] **Step 2: Failing tests.** Append to `shared/stores.test.ts`:

```ts
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
```

(Add the imports `dropUnknownRetailers` from `./stores`, `generateSeedStore` from `./seed/generate` and `type RetailerId` from `./types` if missing.) Also update the existing expectations in `shared/stores.test.ts` that list all eight retailers to the five remaining ids, and replace the `metro` "itemCount is 0" assertion with `expect(summaries).toHaveLength(RETAILERS.length)`.

Create `src/store/useAppStore.test.ts`:

```ts
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
```

Run `npx vitest run shared/stores.test.ts src/store/useAppStore.test.ts` → FAIL.

- [ ] **Step 3: Implement.**

`shared/stores.ts`:

```ts
/** Drops points and locations for chains no longer in RETAILERS (a stale data/prices.json can still have them). */
export function dropUnknownRetailers(store: PriceStore): PriceStore {
  const known = new Set<string>(RETAILERS.map((r) => r.id));
  return {
    ...store,
    points: store.points.filter((p) => known.has(p.retailerId)),
    locations: store.locations.filter((l) => known.has(l.retailerId)),
  };
}
```

`server/data.ts` `loadStoreFromFile`: `currentStore = dropUnknownRetailers(parsed);` (log the kept count). `src/api/mock.ts`: wrap the bundled `data/prices.json` store with `dropUnknownRetailers(...)` where it is chosen over the seed store.

`src/store/useAppStore.ts`: export

```ts
/** v1 -> v2: Metro, Voila and Galleria were removed; drop anything that still points at them. */
export function migrateAppState(persisted: unknown, version: number): unknown {
  if (!persisted || typeof persisted !== "object" || version >= 2) return persisted;
  const known = new Set<string>(RETAILERS.map((r) => r.id));
  const ok = (id: unknown) => id === undefined || (typeof id === "string" && known.has(id));
  const s = persisted as { hiddenStores?: unknown; recentChecks?: unknown };
  const hiddenStores = Array.isArray(s.hiddenStores) ? s.hiddenStores.filter((id) => typeof id === "string" && known.has(id)) : [];
  const recentChecks = Array.isArray(s.recentChecks)
    ? s.recentChecks.filter((c: { input?: { retailerId?: unknown }; best?: { retailerId?: unknown } }) => ok(c?.input?.retailerId) && ok(c?.best?.retailerId))
    : [];
  return { ...s, hiddenStores, recentChecks };
}
```

and change the persist options to `{ name: "realdeal", version: 2, migrate: (s, v) => migrateAppState(s, v) as AppState }`.

`scrapers/import-hammer.ts`: remove the metro/voila/galleria branches in the name mapping (those rows map to nothing and are skipped) and remove them from the retailer list near line 93. `server/scan.ts` `mapRetailer`: delete the three lines for metro/voila/galleria. `server/scan.test.ts`: in the store-name mapping table (~line 398), change `["Metro", "metro"]`, both Voila rows and the Galleria row to expect `undefined` (adapt the table shape as needed). Update the comment in `scrapers/adapters/index.ts` line 9 to say `loblaws is Hammer-only`.

- [ ] **Step 4:** `npm run typecheck && npm run lint && npm run test` → PASS. Fix every type error the narrower `RetailerId` causes (e.g. `Record<RetailerId, …>` maps that list the old ids).

- [ ] **Step 5: Commit** `git commit -am "Remove Metro, Voila and Galleria" && git add src/store/useAppStore.test.ts && git commit --amend --no-edit`

---

### Task 3: "Other" store and tag amount in price checks

**Files:**
- Modify: `shared/types.ts` (`PriceCheckInput`, `Verdict.best` only), `shared/verdict.ts`, `shared/engine/tricks.ts`, `shared/verdict.test.ts`, `server/routes/api.ts` (`POST /check` only), `src/lib/tier.ts`, `src/pages/reveal/result/CheaperElsewhere.tsx`, `src/pages/reveal/RevealResult.tsx` (the `NearbyPrices checkedPrice` prop only), `src/components/domain/NearbyPrices.tsx` (only if needed for types)

**Interfaces:**
- Consumes: `TagAmount` (Task 1).
- Produces: `PriceCheckInput.retailerId?: RetailerId` (absent = Other store), `PriceCheckInput.tagAmount?: TagAmount`, `Verdict.best.retailerId?: RetailerId` (absent = the user's own price at an "Other" store is cheapest).

- [ ] **Step 1: Types.** In `PriceCheckInput`: `retailerId?: RetailerId;  // absent = "Other" store` and add `tagAmount?: TagAmount;  // the amount the price is for, as the user confirmed it (display only; sizeQty carries the converted size)`. In `Verdict`: `best: { retailerId?: RetailerId; price: number; unitPrice: number };`.

- [ ] **Step 2: Failing tests** in `shared/verdict.test.ts` (use the existing seed-store setup in that file; pick an item that has prices at several retailers, e.g. `"butter-salted-454g"`):

```ts
describe("checkPrice with an Other store", () => {
  const store = generateSeedStore();
  it("compares against the all-store average and skips store history", () => {
    const v = checkPrice(store, { itemId: "butter-salted-454g", price: 5.99, wasPrice: 50, source: "scan" });
    expect(v.input.retailerId).toBeUndefined();
    expect(v.saleFreq12w).toBe(0);
    expect(v.avgUnitPrice).toBeGreaterThan(0);
    expect(v.tricks.map((t) => t.type)).not.toContain("perpetual_sale");
    expect(v.tricks.map((t) => t.type)).not.toContain("inflated_was_price");
  });
  it("reports the user's price as best with no retailer when it is cheapest", () => {
    const v = checkPrice(store, { itemId: "butter-salted-454g", price: 0.5, source: "scan" });
    expect(v.best.retailerId).toBeUndefined();
    expect(v.best.price).toBe(0.5);
  });
  it("names a chain as best when one is cheaper", () => {
    const v = checkPrice(store, { itemId: "butter-salted-454g", price: 99, source: "scan" });
    expect(v.best.retailerId).toBeDefined();
  });
  it("uses sizeQty from a tag amount", () => {
    const v = checkPrice(store, { itemId: "bananas-kg", retailerId: "saveon", price: 1.27, sizeQty: 0.45359237, tagAmount: { qty: 1, unit: "lb" }, source: "scan" });
    expect(v.unitPrice).toBeCloseTo(2.7999, 3);
    expect(v.input.tagAmount).toEqual({ qty: 1, unit: "lb" });
  });
});
```

Run `npx vitest run shared/verdict.test.ts` → FAIL (type error / behaviour).

- [ ] **Step 3: Engine.** `shared/verdict.ts` `checkPrice`:

```ts
const rid = input.retailerId;
const mineHistory = rid ? forRetailer(detail.history, rid) : [];
const mine = rid ? stats.byRetailer.find((r) => r.retailerId === rid) : undefined;
...
const candidates: Verdict["best"][] = stats.byRetailer
  .filter((r) => r.retailerId !== rid)
  .map((r) => ({ retailerId: r.retailerId, price: r.currentPrice, unitPrice: r.currentUnitPrice }));
candidates.push({ retailerId: rid, price: input.price, unitPrice });
...
tricks: detectTricks({ item, input, retailer: rid ? retailerById(rid) : undefined, history: mineHistory, ... }),
```

`shared/engine/tricks.ts`: `retailer?: Retailer` in `TrickContext`. Skip `perpetual_sale` when `!retailer`. Any other trick whose `detail` uses `retailer.name` is skipped when `retailer` is undefined; tricks that only use `history` already do nothing with an empty history (keep it that way).

- [ ] **Step 4: Server route** `POST /api/check` in `server/routes/api.ts`: `retailerId` is optional; when present it must be a known retailer (same 400 message). Validate optional `tagAmount`: an object with `qty` a positive finite number and `unit` one of `"g","kg","lb","oz","mL","L","each","dozen"`, else 400 `"tagAmount must have a positive qty and a known unit"`. Pass `tagAmount` into `input`.

- [ ] **Step 5: UI consumers.**
  - `src/lib/tier.ts` (~line 47): only say "Put it back. X has it for …" when `v.best.retailerId !== undefined && v.best.retailerId !== v.input.retailerId`.
  - `CheaperElsewhere.tsx`: `hasCheaperElsewhere` returns false when `best.retailerId === undefined`; never call `retailerById` with undefined.
  - `RevealResult.tsx`: pass `checkedPrice` to `NearbyPrices` only when `verdict.input.retailerId` is defined: `checkedPrice={verdict.input.retailerId ? { retailerId: verdict.input.retailerId, unitPrice: verdict.unitPrice } : undefined}`.
  - Fix any other compile error from the optional fields (`npm run typecheck` lists them).

- [ ] **Step 6:** `npm run typecheck && npm run lint && npm run test` → PASS.

- [ ] **Step 7: Commit** `git commit -am "Support an Other store and tag amounts in price checks"`

---

### Task 4: Server scan reads the price's own unit

**Files:**
- Modify: `server/scan.ts`, `server/scan.test.ts`, `shared/types.ts` (`ScanResult` only), `src/api/mock.ts` (sample scan results only)

**Interfaces:**
- Consumes: `parseTagAmount`, `toItemUnits`, `sameAmount` (Task 1); `parsePrice` from `scrapers/parse.ts` (returns `{ price, per? }`; only `.price` is used).
- Produces: `ScanResult.tagAmount?: TagAmount`; `ScanResult.sizeQty` = `toItemUnits(tagAmount, candidates[0].unit)` whenever `tagAmount` is set.

- [ ] **Step 1:** `shared/types.ts` `ScanResult`: add `tagAmount?: TagAmount;  // the amount the scanned price is for, as printed`.

- [ ] **Step 2: Failing tests** in `server/scan.test.ts` inside `describe("postProcess")`:

```ts
it("reads a per-lb produce tag even when the kg line is in unitPriceText (plantain tag)", () => {
  const res = postProcess({
    isPriceTag: true, productName: "Banana Plantain", price: 1.27, priceUnitText: "lb",
    unitPriceText: "$2.81 kg", rawText: "Banana Plantain $1.27 lb/ $2.81 kg 4235 50292092 01/18/2026",
  }, store);
  expect(res.status).toBe("ok");
  expect(res.price).toBe(1.27);
  expect(res.tagAmount).toEqual({ qty: 1, unit: "lb" });
  expect(res.sizeQty).toBeCloseTo(0.45359237, 6);
});

it("works out per lb from the kg line when the model gives no priceUnitText", () => {
  const res = postProcess({
    isPriceTag: true, productName: "Banana Plantain", price: 1.27, unitPriceText: "$2.81 kg",
    rawText: "Banana Plantain $1.27 lb/ $2.81 kg",
  }, store);
  expect(res.tagAmount).toEqual({ qty: 1, unit: "lb" });
  expect(res.price).toBe(1.27);
});

it("prefers the cross-check when the model's priceUnitText disagrees with the printed unit price", () => {
  const res = postProcess({
    isPriceTag: true, productName: "Bananas", price: 1.27, priceUnitText: "kg", unitPriceText: "$2.81/kg",
    rawText: "Bananas $1.27 lb $2.81/kg",
  }, store);
  expect(res.tagAmount).toEqual({ qty: 1, unit: "lb" });
});

it("keeps a printed package size that agrees with the cross-check", () => {
  const res = postProcess({
    isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99, unitPriceText: "$1.32/100g",
    rawText: "Salted Butter 454 g $5.99 $1.32/100g",
  }, store);
  expect(res.tagAmount).toEqual({ qty: 454, unit: "g" });
  expect(res.sizeQty).toBeCloseTo(0.454, 6);
});

it("ignores a tag amount whose unit does not fit the matched item", () => {
  const res = postProcess({
    isPriceTag: true, productName: "Salted Butter", sizeText: "1 L", price: 5.99, rawText: "Salted Butter 1 L $5.99",
  }, store);
  expect(res.tagAmount).toBeUndefined();
  expect(res.sizeQty).toBeUndefined();
});
```

Also update existing tests that assumed the old behaviour: the butter test's `expect(res.sizeQty).toBeUndefined()` becomes `expect(res.sizeQty).toBeCloseTo(0.454, 6)` and `expect(res.tagAmount).toEqual({ qty: 454, unit: "g" })`; any per-lb test that expected the price converted to per-kg now expects the printed price unchanged with `tagAmount { qty: 1, unit: "lb" }`. Run `npx vitest run server/scan.test.ts` → FAIL.

- [ ] **Step 3: Implement** in `server/scan.ts`:
  - `RawGeminiExtraction.priceUnitText?: string | null`. In `RESPONSE_SCHEMA` add `priceUnitText: { type: Type.STRING, description: "The amount the main price is for, exactly as printed right next to it, e.g. 'lb', '/kg', 'ea', '100 g', '454 g'. Null if nothing is printed next to the price." }`. In `PROMPT` add the sentence: `"priceUnitText is what the main price is for, as printed beside it (a tag reading '$1.27 lb' has priceUnitText 'lb'); never take it from the per-kg or per-100 g line."`
  - Delete the whole "Adjust for per-lb produce pricing" block (`isPerKgProduce`, `hasPerLbIndicator`, the price conversion) and the old `sizeQty` block that used `parseSize`.
  - Add:

```ts
/** The amount the price is for, worked out from the printed unit-price line: $1.27 with "$2.81 kg" is 1 lb. Weight only. */
function amountFromUnitPrice(price: number, unitPriceText: string | null | undefined): TagAmount | undefined {
  // parsePrice gives the number; parseTagAmount gives the unit ("$2.81 kg" has no slash, which parsePrice's `per` misses)
  const upPrice = parsePrice(unitPriceText ?? "")?.price;
  const upAmount = parseTagAmount(unitPriceText);
  const upKg = upAmount ? toItemUnits(upAmount, "kg") : undefined;
  if (!upPrice || !(upPrice > 0) || !upKg) return undefined;
  const perKg = upPrice / upKg;
  const kg = price / perKg;
  const options: TagAmount[] = [{ qty: 1, unit: "lb" }, { qty: 1, unit: "kg" }, { qty: 100, unit: "g" }];
  return options.find((o) => Math.abs((toItemUnits(o, "kg") ?? 0) - kg) / kg <= 0.03);
}
```

  and in `postProcess`, after `price` is known and `topItem = candidates[0]`:

```ts
const fits = (a: TagAmount | undefined): a is TagAmount => a !== undefined && toItemUnits(a, topItem.unit) !== undefined;
const printed = [parseTagAmount(raw.priceUnitText), parseTagAmount(raw.sizeText)].filter(fits);
const cross = topItem.unit === "kg" ? amountFromUnitPrice(price, raw.unitPriceText) : undefined;
const tagAmount = cross ? (printed.find((a) => sameAmount(a, cross, topItem.unit)) ?? cross) : printed[0];
const sizeQty = tagAmount ? toItemUnits(tagAmount, topItem.unit) : undefined;
```

  Return `tagAmount` and `sizeQty` in the ok result. Remove the now-unused `parseSize` import if nothing else uses it.
  - `handleSample`: add `tagAmount` + `sizeQty`: butter `{ qty: 454, unit: "g" }` / 0.454; yogurt `{ qty: 500, unit: "g" }` / 0.5 (replace its existing `sizeQty: 0.5`); pasta `{ qty: 900, unit: "g" }` / 0.9.
  - Mock scanning: `src/api/mock.ts` builds its own sample `ScanResult`s (~lines 29-70, a canned table with `sizeQty`). Add `tagAmount?: TagAmount` to that canned type, give the three samples the same `tagAmount`/`sizeQty` as `handleSample`, and copy `tagAmount` onto the result next to the existing `sizeQty` line.

- [ ] **Step 4:** `npm run typecheck && npm run lint && npm run test` → PASS.

- [ ] **Step 5: Commit** `git commit -am "Scan reads the unit printed next to the price"`

---

### Task 5: Results page in the tag's unit; remove Replay

**Files:**
- Modify: `src/pages/reveal/result/NumbersCard.tsx`, `src/pages/reveal/RevealResult.tsx`, `src/pages/reveal/RevealPage.tsx`

**Interfaces:**
- Consumes: `verdict.input.tagAmount`, `formatTagAmount` (Task 1).

- [ ] **Step 1: NumbersCard.** When `verdict.input.tagAmount` is set (call it `tag`), ignore the price-display setting and show tag terms, with `size = verdict.input.sizeQty ?? verdict.item.sizeQty`:
  - "You'd pay": `<PriceText size="lg" amount={unitPrice * size} />` and under it `<span className="text-small font-bold text-ink-soft">{formatTagAmount(tag)}</span>`
  - "Usual price": `amount={avgUnitPrice * size}` with the same label, `className="text-ink-soft"` as now.
  - Range line: `90-day range ${formatMoney(low90 * size)} to ${formatMoney(high90 * size)} ${formatTagAmount(tag)}` (e.g. "90-day range $1.05 to $1.40 per lb").
  - Without `tag`: exactly today's rendering.
  Keep the layout (two-column grid inside the Card, gauge below, savings line after).

- [ ] **Step 2: Remove Replay.** `RevealResult`: delete the Replay `Button` and the `onReplay` prop (`RevealResultProps = { verdict: Verdict }`); remove the unused `Button` import if it becomes unused. `RevealPage`: stop passing `onReplay`; delete the `replay` function only if nothing else uses it (lint must stay clean).

- [ ] **Step 3:** `npm run typecheck && npm run lint && npm run test` → PASS.

- [ ] **Step 4: Commit** `git commit -am "Results show the tag's unit; remove Replay"`

---

### Task 6: Confirm sheet layout, store choice, scanner without store chip

**Files:**
- Modify: `src/pages/scan/ScanConfirmSheet.tsx`, `src/pages/scan/ScanPage.tsx`, `src/pages/scan/Viewfinder.tsx` (remove the `hint` prop only), `src/components/domain/ItemRow.tsx` (add `showSizes` prop)
- Create: `src/pages/scan/parts/useStoreChoices.ts`, `src/pages/scan/parts/storeOrder.ts`, `src/pages/scan/parts/storeOrder.test.ts`
- Delete: `src/pages/scan/StoreHint.tsx`, `src/pages/scan/parts/useNearestStore.ts` (check with grep that nothing else imports them)

**Interfaces:**
- Consumes: `amountForItem`, `toItemUnits`, `compatibleUnits`, `formatTagAmount` (Task 1); `ScanResult.tagAmount` (Task 4); `PriceCheckInput.retailerId?`, `tagAmount?` (Task 3); `api.getNearbyPrices(itemId, point, limit)` returns `NearbyStorePrice[]` nearest first; `useUserLocation()` returns `{ point, source: "gps" | "default", status, request }`; `useMyRetailers()` returns `Retailer[]`.
- Produces: `orderRetailers(mine: Retailer[], nearby: NearbyStorePrice[]): { ordered: Retailer[]; atStore?: StoreLocation }` and `useStoreChoices(itemId: string | undefined): { ordered: Retailer[]; atStore?: StoreLocation; locating: boolean }`.

- [ ] **Step 1: Failing test** `src/pages/scan/parts/storeOrder.test.ts`:

```ts
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
```

Run `npx vitest run src/pages/scan/parts/storeOrder.test.ts` → FAIL.

- [ ] **Step 2: Implement** `storeOrder.ts`:

```ts
import type { NearbyStorePrice, Retailer, StoreLocation } from "@shared/types";

export const AT_STORE_KM = 0.3;

/** The user's stores, nearest chain first; atStore is the branch they are standing in, if any. */
export function orderRetailers(mine: Retailer[], nearby: NearbyStorePrice[]): { ordered: Retailer[]; atStore?: StoreLocation } {
  const allowed = new Set(mine.map((r) => r.id));
  const seen: Retailer[] = [];
  for (const n of nearby) {
    const r = mine.find((m) => m.id === n.store.retailerId);
    if (r && !seen.includes(r)) seen.push(r);
  }
  const ordered = [...seen, ...mine.filter((r) => !seen.includes(r))];
  const first = nearby[0];
  const atStore = first && first.distanceKm <= AT_STORE_KM && allowed.has(first.store.retailerId) ? first.store : undefined;
  return { ordered, atStore };
}
```

and `useStoreChoices.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useMyRetailers } from "@/lib/useMyRetailers";
import { useUserLocation } from "@/lib/useUserLocation";
import { orderRetailers } from "./storeOrder";

/** Store choices for the confirm sheet, nearest first when GPS is on. */
export function useStoreChoices(itemId: string | undefined) {
  const mine = useMyRetailers();
  const { point, source, status } = useUserLocation();
  const query = useQuery({
    queryKey: ["scan-store-choices", itemId, point.lat, point.lng],
    queryFn: () => api.getNearbyPrices(itemId ?? "", point, 50),
    enabled: source === "gps" && itemId !== undefined,
    staleTime: 5 * 60_000,
  });
  return { ...orderRetailers(mine, query.data ?? []), locating: status === "locating" || query.isFetching };
}
```

- [ ] **Step 3: ItemRow** gets `showSizes?: boolean` (default `true`); when false the "Sizes: …" line is not rendered.

- [ ] **Step 4: ScanPage / Viewfinder.**
  - Remove `StoreHint`, the `chosen` state, `useNearestStore`, `fallbackRetailerId` and the Viewfinder `hint` prop (delete the `{!failed && hint}` line and the prop from `ViewfinderProps`).
  - On mount, ask for location once: `const loc = useUserLocation(); useEffect(() => { if (loc.source !== "gps" && loc.status === "idle") loc.request(); // eslint-disable-line react-hooks/exhaustive-deps\n }, []);` (or use a ref to the request function, as ScanPage already does for `camera.start`, to avoid the disable comment — preferred).
  - `typeItIn` uses `result?.retailerId` only.
  - `<ScanConfirmSheet open={phase === "confirm"} result={result} onRetake={retake} onClose={backToViewfinder} />`.

- [ ] **Step 5: ScanConfirmSheet rewrite** (props: `open`, `result`, `onRetake`, `onClose`). Read DESIGN.md first. Order, top to bottom:

  1. **Product** section: `<ItemRow item={item} showSizes={false} right={Change button as today} />` and the same "other candidates / Search instead" chips as today.
  2. **On the tag** section (`<h3 className="text-h3">On the tag</h3>`), always shown when an item is selected:
     - View mode: `<PriceText amount={priceNum} size="xl" />` (or "No price yet"), and under it `<p className="text-body font-extrabold text-ink-soft">{formatTagAmount(amount)}</p>`. If `!fromTag`, a line `<p className="text-small text-ink-soft">Not on the tag. Check it matches.</p>`. One **Edit** link (same `linkClass` button as today) opens edit mode.
     - Edit mode: `TextField label="Price"` (prefix "$", decimal), `TextField label="Amount"` (decimal) and a row of `Chip`s, one per `compatibleUnits(item.unit)`, `selected` on the current unit, label = the unit, but `"each"` shows as "pack"; then a Done link. Done: if price > 0 keep it; if amount > 0 set `{ qty, unit }`, `fromTag` stays as it was unless the user changed it (then `fromTag = true` so the "Not on the tag" note disappears — the user confirmed it).
     - Opens in edit mode when `result.price === undefined`.
     - The existing was-price and multi-buy rows and their edit modes stay below, unchanged. Delete the old size row, `sizeEditUnit` and `startSizeEdit`.
     - Initial amount: `amountForItem(result.tagAmount, item)`. When the user picks a different candidate item, recompute with `amountForItem(currentAmountIfFromTag, newItem)` so an incompatible unit resets to the new item's catalogue size.
  3. **Store** section (`<h3 className="text-h3">Which store?</h3>`), using `useStoreChoices(item?.id)`:
     - State `store: RetailerId | "other" | undefined`, initial `result.retailerId`. When `atStore` arrives and the user has not chosen (`store === undefined` and no manual pick yet), set `store = atStore.retailerId`.
     - When `store` is set and the picker is closed: one row: `StoreTile` is not needed; show the text `At {atStore.name}` when `store === atStore?.retailerId`, `retailerById(store).name` for a chain, `Other store` for "other", plus a Change link that opens the picker.
     - Picker (open when `store === undefined` or after Change): the `StoreTile` grid (`grid grid-cols-2 gap-3`, `size="md"`) over `ordered`, then `<Chip selected={store === "other"} onClick={…} className="min-h-12">Other store</Chip>`. Picking closes the picker. While `locating`, show `<p className="text-small text-ink-soft">Finding the nearest store…</p>` above the grid.
  4. Error line, **Check price** (disabled until item, price > 0, amount > 0 and a store or Other is chosen), **Retake**.

  `handleCheck`:

```ts
await run({
  itemId: item.id,
  retailerId: store === "other" ? undefined : store,
  price: priceNum,
  wasPrice,
  multiBuy,
  sizeQty: toItemUnits(amount, item.unit),
  tagAmount: amount,
  source: "scan",
});
```

- [ ] **Step 6:** `npm run typecheck && npm run lint && npm run test` → PASS.

- [ ] **Step 7: Commit** `git add -A src/pages/scan src/components/domain/ItemRow.tsx && git commit -m "Confirm sheet: product, tag price and amount, nearest store with Other"`

---

### Task 7: Tap to focus and expose

**Files:**
- Modify: `src/pages/scan/useCamera.ts`, `src/pages/scan/Viewfinder.tsx`, `src/pages/scan/ScanPage.tsx` (pass the new props only)
- Create: `src/pages/scan/parts/focusPoint.ts`, `src/pages/scan/parts/focusPoint.test.ts`, `src/pages/scan/parts/FocusRing.tsx`

**Interfaces:**
- Produces: `tapToVideoPoint(tap: { x: number; y: number }, box: { left: number; top: number; width: number; height: number }, video: { width: number; height: number }): { x: number; y: number } | undefined`; `UseCamera.focusSupported: boolean`; `UseCamera.focusAt(p: { x: number; y: number }): Promise<boolean>`.

- [ ] **Step 1: Failing test** `focusPoint.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tapToVideoPoint } from "./focusPoint";

describe("tapToVideoPoint", () => {
  const box = { left: 0, top: 0, width: 390, height: 844 };
  it("maps the centre to the centre", () => {
    const p = tapToVideoPoint({ x: 195, y: 422 }, box, { width: 1920, height: 1080 });
    expect(p?.x).toBeCloseTo(0.5, 5);
    expect(p?.y).toBeCloseTo(0.5, 5);
  });
  it("accounts for object-cover cropping of a landscape stream in a portrait box", () => {
    // scale = max(390/1920, 844/1080) = 0.78148; shown width = 1500.4, cropped (1500.4-390)/2 = 555.2 each side
    const p = tapToVideoPoint({ x: 0, y: 0 }, box, { width: 1920, height: 1080 });
    expect(p?.x).toBeCloseTo(555.2 / 1500.4, 3);
    expect(p?.y).toBeCloseTo(0, 5);
  });
  it("respects the box offset and clamps to 0..1", () => {
    const p = tapToVideoPoint({ x: 10, y: 2000 }, { left: 20, top: 0, width: 400, height: 400 }, { width: 400, height: 400 });
    expect(p).toEqual({ x: 0, y: 1 });
  });
  it("returns undefined before the video has a size", () => {
    expect(tapToVideoPoint({ x: 1, y: 1 }, box, { width: 0, height: 0 })).toBeUndefined();
  });
});
```

- [ ] **Step 2: Implement** `focusPoint.ts`:

```ts
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Where a tap lands in the camera frame (0..1 each way), for a video shown with object-fit: cover. */
export function tapToVideoPoint(
  tap: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  video: { width: number; height: number },
): { x: number; y: number } | undefined {
  if (!(video.width > 0 && video.height > 0 && box.width > 0 && box.height > 0)) return undefined;
  const scale = Math.max(box.width / video.width, box.height / video.height);
  const shownW = video.width * scale;
  const shownH = video.height * scale;
  const x = (tap.x - box.left - (box.width - shownW) / 2) / shownW;
  const y = (tap.y - box.top - (box.height - shownH) / 2) / shownH;
  return { x: clamp01(x), y: clamp01(y) };
}
```

- [ ] **Step 3: useCamera.** When a stream opens (where `torchSupported` is set from `getCapabilities()`), also read `focusMode?: string[]` and `exposureMode?: string[]` from the capabilities (declare a local `FocusCapabilities` interface like `TorchCapabilities`), keep them in a ref, and `setFocusSupported(Boolean(focusModes.length || exposureModes.length))`. Reset to false when the stream is released. Add:

```ts
const focusAt = useCallback(async (p: { x: number; y: number }) => {
  const track = streamRef.current?.getVideoTracks()[0];
  const caps = focusCapsRef.current;
  if (!track || !caps) return false;
  const pick = (modes: string[]) => (modes.includes("continuous") ? "continuous" : modes.includes("single-shot") ? "single-shot" : undefined);
  const set: Record<string, unknown> = { pointsOfInterest: [p] };
  const focusMode = pick(caps.focusModes);
  const exposureMode = pick(caps.exposureModes);
  if (focusMode) set.focusMode = focusMode;
  if (exposureMode) set.exposureMode = exposureMode;
  if (!focusMode && !exposureMode) return false;
  try {
    await track.applyConstraints({ advanced: [set] } as unknown as MediaTrackConstraints);
    return true;
  } catch {
    return false; // the camera refused: leave it as it was
  }
}, []);
```

Return `focusSupported` and `focusAt` from the hook and add them to `UseCamera`.

- [ ] **Step 4: FocusRing.tsx**: an absolutely positioned 72px circle (`size-18 rounded-full border-3 border-white`, `pointer-events-none`, `aria-hidden`) centred on `{ x, y }` (px in the viewfinder box). With motion: scale 1.4 → 1 and fade out over 0.7 s; with `useReducedMotion()` true: no scale, just shown then faded. Rendered inside `AnimatePresence`, keyed by a tap counter, removed after 700 ms.

- [ ] **Step 5: Viewfinder.** New props `focusSupported: boolean` and `onFocusAt: (p: { x: number; y: number }) => void`. Add a full-size tap layer above the video and guide frame but below the top controls and bottom controls (controls stay clickable): `<div aria-hidden className="absolute inset-0" onPointerUp={…} />`. On pointer up (primary pointer only, not when the menu is open, not when `cameraState !== "live"`): compute `tapToVideoPoint({ x: e.clientX, y: e.clientY }, layer.getBoundingClientRect(), { width: video.videoWidth, height: video.videoHeight })`; if a point and `focusSupported`, call `onFocusAt(point)` and show the FocusRing at the tap position relative to the layer. If the GuideFrame or the Penny hint intercept taps, give them `pointer-events-none`. ScanPage passes `focusSupported={camera.focusSupported}` and `onFocusAt={(p) => void camera.focusAt(p)}`.

- [ ] **Step 6:** `npm run typecheck && npm run lint && npm run test` → PASS.

- [ ] **Step 7: Commit** `git add -A src/pages/scan && git commit -m "Tap to focus and expose"`

---

### After the tasks (controller)

- Add to `BLOCKERS.md`: `- [SCAN-UNITS] scrapers/parse.ts parseSize maps "per lb" to 1 kg; the scan no longer uses it, but scrapers still do. Workaround: none needed for scanning.`
- `npm run build`, then a Playwright pass on `npm run dev` (mock API): scan a sample tag, check the confirm sheet order and the results page at 390px and 1280px.
