# DATA-02: Seed price generator + hero stories

| | |
|---|---|
| Suggested agent | GLM / Claude |
| Paste with | `specs/context/CORE.md`, `specs/context/BACKEND.md` (or use the ready-made bundle `specs/bundles/DATA-02.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **DATA-02**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, BACKEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/seed/generate.ts`
- `shared/seed/rng.ts`
- `shared/seed/generate.test.ts`

## Goal
The deterministic seed price generator: 26 weeks of realistic weekly shelf prices per item per store, plus this week's branch prices, with six hand-tuned "hero" stories.

## Contract
- `shared/seed/generate.ts` exports `generateSeedStore(): PriceStore` and `mondays(end: string, count: number): string[]` (keep this helper exported).
- `shared/seed/rng.ts` exports `mulberry32(seed: number): () => number` and `hashString(s: string): number`.
- Reads `SEED_ITEMS` from `./items`, `LOCATIONS` from `./locations`, `DATA_END`/`WEEKS` from `./constants`, `RETAILERS` from `../retailers`. Items currently contain only 3 placeholders while DATA-01 writes the full 40, so look items up by id defensively (skip hero overrides whose item is missing).
- Write `shared/seed/generate.test.ts` (vitest).

## Generation rules
- Seeded RNG (`mulberry32(hashString(itemId + retailerId))`), so output is identical on every run. No `Math.random`, no `Date.now`.
- Dates: `mondays(DATA_END, WEEKS)`, oldest first. All points `source: "seed"`, chain-level (no `storeId`).
- Store multipliers on `basePrice`: nofrills 0.92, walmart 0.95, tnt 1.03, saveon 1.08, each jittered ±3% per item. Weekly noise ±2% (±5% for `seasonal`).
- Seasonal items: multiply by a slow curve, +-15% over the 26 weeks, ending high (October).
- Round to plausible shelf prices: ends in .29, .49, .79, .99 (Walmart .47/.97 endings allowed). Never more than 2 decimals.
- Sales: per store per week, chance by profile (`normal` 18%, `rare` 6%, `perpetual` 80%); sale price = regular × (1 − 15% to 25%), rounded; `onSale: true`, `wasPrice = regularPrice`. `regularPrice` always the non-sale price that week.
- `sizeQty` = the item's `sizeQty` (except the yogurt override).
- Branch points (latest week only): for every location, one point per item with `storeId` = location id, price = that chain's latest chain price × a deterministic branch factor in 0.96–1.04 (rounded to shelf endings), same `onSale`/`wasPrice`/`multiBuy`.
- Return `{ items: ITEMS, points, locations: LOCATIONS, generatedAt: DATA_END + "T12:00:00.000Z" }`.

### Hero overrides

1. **butter-salted-454g @ saveon**: regular price 8.49 all 26 weeks; on sale at 5.99 (with `wasPrice` 8.49) every week **except** 4 weeks, two of which fall in the latest 12. So saleFreq12w = 10/12 and 8.49 was charged in 4 of 26 weeks. Other stores average about $5.80. Cross-store 13-week average must land so that $5.99 is within ±10% (target overall 13-week avg ≈ $6.00; Save-On itself averages ≈ $6.37 because of its two full-price weeks).
2. **flour-ap-10kg**: cross-store 13-week average ≈ $18.50 so that $12.99 at nofrills is ≤ −25%.
3. **greek-yogurt-plain**: all stores sell 0.65 kg at ≈ $6.10 for the first 18 weeks. At walmart, the last 8 weeks are 0.5 kg at $5.97 (same as its earlier price). Other stores stay at 0.65 kg. Item `sizeQty` = 0.5, `sizeLabel` "500 g". Input $5.97 at walmart must be > +10% vs average and flag shrinkflation.
4. **spaghetti-900g @ tnt**: single price 2.59 in most weeks; the latest 3 weeks show `multiBuy { qty: 2, total: 5.00 }` with `price` 2.59. Input "2 for $5.00" must be normal and flag multi-buy trap (2.50 vs 2.59 is a 3.5% saving, under 5%). Make sure the multi-buy weeks don't count as "usual single" weeks.
5. **strawberries-454g**: 13-week average ≈ $4.60; $6.99 at saveon must be > +10%.
6. **eggs-large-12**: 13-week average ≈ $4.60; $3.97 at walmart must be between −10% and −25%.

The tier math the stories must satisfy (implemented by DATA-03, summarised here so you can tune): unit price = effective price / size; average = mean unit price of the latest 13 chain points per store across all 4 stores; tier steal ≤ −25%, good ≤ −10%, normal ≤ +10%, else high.

## Tests (`generate.test.ts`)
- Two calls are deep-equal.
- Every date is a Monday; dates end at `DATA_END`; each item × store has exactly 26 chain points.
- No price has more than 2 decimals; all prices > 0.
- If the full catalogue is present (40 items): 40 × 4 × 26 chain points, and branch points = 40 × locations.length.
- Hero shape checks that don't need the engine: butter at saveon is on sale in exactly 10 of the latest 12 weeks and priced 8.49 in exactly 4 of 26; yogurt at walmart has 0.5 kg in the last 8 weeks and 0.65 before; spaghetti at tnt has `multiBuy { qty: 2, total: 5 }` in exactly the latest 3 weeks.

## Acceptance
- [ ] Deterministic, realistic numbers; hero overrides applied; tests pass.
