# DATA-04: Featured deals, mock API, story tests

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/BACKEND.md` (or use the ready-made bundle `specs/bundles/DATA-04.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **DATA-04**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, BACKEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/seed/featured.ts`
- `src/api/mock.ts`
- `shared/stories.test.ts`

## Goal
The six featured flyer deals, the complete mock API, and the end-to-end story tests that prove the seed data and engine produce the right verdicts.

## Contract
- `shared/seed/featured.ts`: `getFeaturedDeals(store: PriceStore): FeaturedDeal[]`.
- `src/api/mock.ts`: `export const mockApi: Api` (every method of `Api`).
- `shared/stories.test.ts`: vitest file using the real `generateSeedStore()` and `checkPrice()`.
- Uses engine functions from `@shared/verdict` (or `../verdict` inside `shared/`), `TRICKS` from `shared/content/tricks.ts`, `RETAILERS`.

## Featured deals (`shared/seed/featured.ts`)

`getFeaturedDeals(store)` returns these six, in this order, with item objects resolved from the store:

| id | item | store | tag | tagline |
|---|---|---|---|---|
| feat-butter | butter-salted-454g | saveon | price 5.99, was 8.49 | "Flyer says: save $2.50!" |
| feat-flour | flour-ap-10kg | nofrills | price 12.99 | "Big bag, small price?" |
| feat-yogurt | greek-yogurt-plain | walmart | price 5.97 | "Same price as always." |
| feat-pasta | spaghetti-900g | tnt | multiBuy 2 for 5.00 | "2 for $5. Stock up?" |
| feat-berries | strawberries-454g | saveon | price 6.99 | "Fresh this week." |
| feat-eggs | eggs-large-12 | walmart | price 3.97 | "Rollback on eggs." |
Resolve items by id from the store; if an item is missing (catalogue still a placeholder), skip that deal instead of throwing.

## Mock API (`src/api/mock.ts`)

- Build the store once: `generateSeedStore()`.
- Latency: 350ms for everything, 1800ms for `scanImage`.
- `searchItems`: case-insensitive match on name, brand, aliases; empty query returns all (optionally by category), sorted by name.
- `getItem`: throws `Error("Item not found")` for unknown ids.
- `checkPrice`: returns the verdict. (The page saves it to the store; mock does not.)
- `scanImage(image, sampleId)`: canned results.
  - `sample-butter` → butter, saveon, price 5.99, wasPrice 8.49
  - `sample-yogurt` → greek yogurt, walmart, price 5.97, sizeQty 0.5
  - `sample-pasta` → spaghetti, tnt, multiBuy 2 for 5.00
  - any real image with no sampleId → the butter result with `rawText: "SALE 5.99 WAS 8.49 SALTED BUTTER 454G"`
  - `candidates`: the matched item first, then 2 other items from the same category.
- `listTricks`: `TRICKS` from `shared/content/tricks.ts`.
- `getDataStatus`: `{ mode: "mock", updatedAt: new Date(Date.now() - 2h).toISOString(), sources: ["seed"], retailers: all 4 ok, itemsFound 40 }`.
- `getNearbyPrices(itemId, near, limit)`: the engine function on the seed store.

## Story tests (`shared/stories.test.ts`)
For each featured deal, run `checkPrice` on `generateSeedStore()` and assert the tier and the exact set of trick types:

| deal | tier | tricks |
|---|---|---|
| feat-butter | normal | perpetual_sale, inflated_was_price |
| feat-flour | steal | none |
| feat-yogurt | high | shrinkflation |
| feat-pasta | normal | multibuy_trap |
| feat-berries | high | none |
| feat-eggs | good | none |

Skip (with `it.skipIf`) any story whose item isn't in the store yet, so the suite stays green until the full catalogue lands. These tests are the integration check between DATA-01, DATA-02 and DATA-03; the integrator will run them after merging.

## Acceptance
- [ ] `mockApi` satisfies `Api` with no type errors; latency as specified; `getItem` rejects unknown ids.
- [ ] Story tests are written exactly against the table above.
