# DATA-03: Verdict engine + tests

| | |
|---|---|
| Suggested agent | Claude / GLM |
| Paste with | `specs/context/CORE.md`, `specs/context/BACKEND.md` (or use the ready-made bundle `specs/bundles/DATA-03.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **DATA-03**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, BACKEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/verdict.ts`
- `shared/engine/**` (any files inside this folder)
- `shared/verdict.test.ts`

## Goal
The verdict engine: pure TypeScript shared by the browser (mock mode) and the server (live mode). Correct numbers matter more than anything else in the app.

## Contract (keep every export from the current `shared/verdict.ts`)
```ts
export { DATA_END, WEEKS } from "./seed/constants";
export { generateSeedStore } from "./seed/generate";
export function unitPriceOf(price: number, sizeQty: number, multiBuy?: MultiBuy): number;
export function tierFor(pct: number): VerdictTier;
export function distanceKm(a: GeoPoint, b: GeoPoint): number;
export function mergeStores(base: PriceStore, overlays: PricePoint[][]): PriceStore;
export function getItemDetail(store: PriceStore, itemId: string): ItemDetail;
export function checkPrice(store: PriceStore, input: PriceCheckInput, now?: Date): Verdict;
export function searchItems(store: PriceStore, q: string, category?: Category): Item[];
export function getNearbyPrices(store: PriceStore, itemId: string, near: GeoPoint, limit?: number): NearbyStorePrice[];
```
- You may split internals into `shared/engine/*.ts` and re-export from `verdict.ts`.
- No DOM or Node APIs. For ids use `globalThis.crypto?.randomUUID?.()` with a `Math.random` fallback (first 8 chars).
- No imports from `src/`. Write a local `money(n)` → "$5.99" helper for trick text.
- Write tests against a small hand-built fixture store in `shared/engine/fixtures.ts` (not the seed generator, which another agent is writing).

## Rules (exact)

- **Chain-level only**: every calculation below (averages, sale frequency, tricks, best) uses only points with no `storeId`. Branch points are used only by `getNearbyPrices`.
- **Effective price** = `multiBuy ? multiBuy.total / multiBuy.qty : price`.
- **Unit price** = effective price / sizeQty. Round only for display, never in calculations.
- **Window**: per retailer, the latest 13 weekly points (≈90 days). `avgUnit90` = mean of the unit prices of all those points across all 4 retailers (≈52 values). `low90` / `high90` = min / max of the same set.
- **pctVsAvg** = (inputUnit − avg) / avg, where inputUnit uses `input.sizeQty ?? latest sizeQty at that retailer ?? item.sizeQty`.
- **Tier**: `pct <= -0.25` steal; `pct <= -0.10` good; `pct <= 0.10` normal; else high.
- **savingsVsAvg** = (avg − inputUnit) × inputSize.
- **saleFreq12w** = count of `onSale` in the latest 12 points at the input retailer / 12.
- **best** = the retailer with the lowest current unit price (latest point per retailer; include the input store at the input price).
- **dataPoints** = total points used for this item.
- **Tricks**, evaluated against the input retailer's history:
  - `perpetual_sale`: `saleFreq12w >= 0.5` AND (`input.wasPrice` is set OR that store's latest point is `onSale`). Title "Forever sale". Detail: "{Store} has had this on sale {n} of the last 12 weeks. The sale price is really the regular price." Stat: "{n} of 12 weeks".
  - `inflated_was_price`: `input.wasPrice` set AND the number of the latest 26 points with `price >= wasPrice * 0.98` divided by 26 is `< 0.25`. Title "Inflated 'was' price". Detail: "The tag claims {claimedPct}% off, but it only sold for {was} in {k} of the last 26 weeks. Against the real average you're saving {realPctText}." (`realPctText` = "nothing" if pct ≥ 0, else "{x}%"). Stat: "{k} of 26 weeks".
  - `multibuy_trap`: `input.multiBuy` set AND per-unit multi-buy price `>= usualSingle * 0.95`, where `usualSingle` = median `price` of points at that store in the latest 12 weeks that have no `multiBuy`. If per-unit is higher than usualSingle, detail: "Buying {qty} actually costs {diff} more each than buying one." Else: "Buying {qty} saves you just {diff} each compared with its usual single price." Title "Multi-buy trap". Stat: "{diff} each".
  - `shrinkflation`: `oldSize` = max `sizeQty` at that store in the latest 26 weeks; `newSize` = the size used for inputUnit. Flag if `newSize <= oldSize * 0.95` AND inputUnit ≥ (median unit price of that store's points at `oldSize`) × 1.03. Title "Shrinkflation". Detail: "This shrank from {old} to {new}, and the price per {unit} went up {x}%." Stat: "{shrinkPct}% smaller".
  - Use `formatMoney`-style output in strings without importing from `src/` (write a tiny local `money()` helper in shared).
- **Nearby prices** (`getNearbyPrices`): for every location in `store.locations`, compute `distanceKm` from `near`, sort ascending, take `limit`. For each, price = the latest branch point for that `storeId` if one exists in the latest week (`priceScope: "store"`), else the retailer's latest chain point (`priceScope: "chain"`). `tier` = `tierFor((unit - avgUnit90) / avgUnit90)`. `live` = point source is "scrape".
- **mergeStores**: items and locations come from `base`; the merge key is `itemId + retailerId + date + (storeId ?? "chain")`; later overlays win and keep their `source`.
- **getItemDetail**: `history` = chain points for the item, oldest first. `byRetailer` in `RETAILERS` order with `live` = latest point's source is "scrape". Throw `Error("Item not found")` for unknown ids.
- **searchItems**: case-insensitive substring match on name, brand, aliases; empty query returns all (optionally filtered by category); sorted by name.

## Tests (`shared/verdict.test.ts`, using `shared/engine/fixtures.ts`)
Build a fixture store with 3 items × 4 stores × 26 weeks where you control every number, then test:
- `tierFor` boundaries: −0.30 steal, −0.25 steal, −0.2499 good, −0.10 good, −0.0999 normal, 0.10 normal, 0.1001 high.
- `unitPriceOf(5, 0.9, { qty: 2, total: 5 })` = 2.5 / 0.9.
- avg/low/high over the latest 13 points per store; branch points are ignored by `getItemDetail` and `checkPrice`.
- Each trick fires on a constructed positive case and does not fire on a near-miss case (e.g. sale 5 of 12 weeks → no perpetual flag; multi-buy saving 6% → no trap; size −4% → no shrinkflation).
- `best` picks the cheapest current unit price, including the input itself.
- `mergeStores` overlay replaces a point with the same key and keeps branch points separate from chain points.
- `distanceKm` SFU Burnaby (49.2781, −122.9199) → downtown Vancouver (49.2827, −123.1207) ≈ 14.6 km.
- `getNearbyPrices` sorts by distance, respects `limit`, uses a branch point when present (`priceScope: "store"`) and falls back to chain (`"chain"`).

## Acceptance
- [ ] All tests pass with `npx vitest run shared`.
- [ ] Trick strings read naturally with real numbers ("on sale 10 of the last 12 weeks").
