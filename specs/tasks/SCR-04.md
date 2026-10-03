# SCR-04: ItemRow, FlyerDealCard, DataFreshness

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-04.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-04**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/domain/ItemRow.tsx`
- `src/components/domain/FlyerDealCard.tsx`
- `src/components/domain/DataFreshness.tsx`

## Goal
Three domain components used on several screens: the item row, the flyer deal card, and the data freshness line.

## Contract
- `ItemRow(props: { item: Item; right?: ReactNode; onClick?(); className? })`
- `FlyerDealCard(props: { deal: FeaturedDeal; onCheck(deal); loading?; className? })`
- `DataFreshness(props: { compact?; className? })`

## Requirements
**ItemRow**: `.lifted rounded-md bg-canvas`, min height 64, padding 12. `ItemArt` 48px, name (Nunito 800 h3, truncate) above `sizeLabel` (small ink-soft), then `right`, then `CaretRight` if `onClick`. Renders a `button` when clickable (2px press like interactive Card), otherwise a `div`.

**FlyerDealCard**: 220px wide `.lifted rounded-md` card, padding 16, gap 12.
- Top: mini shelf tag in markup: `bg-normal rounded-sm` block with a 3px `normal-lip` bottom edge, tilted −2°, price in Fredoka 700 32px (cents raised), "was $X" crossed out (diagonal line) if `wasPrice`, or "2 for $5.00" for `multiBuy`; a small white "SALE" strip if `wasPrice` exists.
- Below: `ItemArt` 40px + item name (Nunito 800) + store `shortName` next to a 10px dot in the store tile colour (`bg-tangerine` etc. via `retailerById(deal.retailerId).tile`).
- `deal.tagline` in small ink-soft.
- `<Button size="md" fullWidth loading={loading}>Check it</Button>` → `onCheck(deal)`.

**DataFreshness**: `useQuery(["status"], api.getDataStatus)`.
- Line: `Clock` icon + "Prices updated {formatRelativeTime(updatedAt)}". If `sources` includes "scrape": append a second item with `Broadcast` icon + "live prices from {n} stores" (n = retailers with `ok` and `lastScrapedAt`).
- `compact`: single line, small, ink-soft. Non-compact: also lists each retailer with `ok: false` as "{retailer name}: using saved prices".
- Render nothing while loading or on error.

## Acceptance
- [ ] Components match DESIGN and look right in a list and in a horizontal scroller.
