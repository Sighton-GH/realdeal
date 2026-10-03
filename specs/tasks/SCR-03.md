# SCR-03: Check home screen

| | |
|---|---|
| Suggested agent | Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-03.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-03**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/check/CheckHomePage.tsx`
- `src/pages/check/home/**` (any files inside this folder)

## Goal
The Check home screen at `/check`: search, scan entry, categories, flyer deals, and recent checks.

## Contract
- `src/pages/check/CheckHomePage.tsx`: `export function CheckHomePage()`. Sub-components go in `src/pages/check/home/`.
- Uses `ItemRow`, `FlyerDealCard`, `DataFreshness` from `@/components/domain` (SCR-04; props in CONTEXT), `useRunCheck` from `@/pages/check` (frozen).

## Layout
```
[TopBar: logo | sound]           (call useTopBar({}))
Penny idle 72px + SpeechBubble "What are we checking today?"
[SearchField "Search milk, eggs, flour..."]
[SCAN A PRICE TAG] primary, Scan icon, full width -> /scan
(Dairy) (Produce) (Bakery) (Pantry)   Chips, horizontal scroll
-- when searching or a chip is selected: results list replaces the sections below --
Section "Flyer deals to check"        horizontal snap-scroll of FlyerDealCards
Section "Your recent checks" [Clear]  ItemRows with VerdictBadge + price
DataFreshness compact
```

## Behaviour
- `?focus=search` autofocuses the search field.
- Search: 200ms debounce; `useQuery(["search", q, category], () => api.searchItems(q, category))`. Results as `ItemRow`s → `/check/:itemId`. Category chips toggle one at a time; with an empty query they list that category. Category labels: Dairy, Produce, Bakery, Pantry.
- No results: `<EmptyState mood="meh" title="Penny doesn't track that yet" body="We cover 40 everyday groceries for now. Try milk, eggs, flour, or bananas." />`.
- Flyer deals: `api.getFeatured()`. "Check it" runs `useRunCheck().run({ ...deal fields, source: "flyer" })`; only that card shows `loading`.
- Recent checks from `useAppStore` (`recentChecks`, max 5 shown). Row `right` = `VerdictBadge` + `PriceText size="sm"` of the checked price. Tap → `/reveal/:checkId`. "Clear" (ghost) opens a `Sheet` titled "Clear your recent checks?" with `Button variant="high"` "Clear checks" and secondary "Keep them".
- Empty recent: inline EmptyState with mood `idle` (pass `className` to shrink padding): title "No checks yet", body "Pick a flyer deal above or scan a tag."
- Loading: Skeletons shaped like the flyer cards (220×300) and rows (64px tall). Featured error: one ink-soft line "Couldn't load flyer deals." with a ghost "Try again" (refetch).
- Padding `px-5 py-6`, sections `gap-7`.

## Acceptance
- [ ] Search, chips, flyer deals, recent checks, and clear all work with the mock API.
- [ ] Every loading, empty, and error state exists with the copy above.
