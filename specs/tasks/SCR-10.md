# SCR-10: Item detail screen

| | |
|---|---|
| Suggested agent | Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-10.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-10**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/item/**` (any files inside this folder)

## Goal
The item detail screen at `/item/:itemId`: the evidence behind a verdict.

## Contract
- `src/pages/item/ItemDetailPage.tsx`: `export function ItemDetailPage()`. Sub-components in `src/pages/item/`.
- Uses `PriceHistoryChart`, `SaleStreak`, `NearbyPrices`, `DataFreshness`, `VerdictBadge`, and `useRunCheck` (props in CONTEXT). `tierFor` and `unitPriceOf` from `@shared/verdict`.

## Layout (`useTopBar({ back: true })`, `px-5 py-6 gap-7`)
```
[art 72] Salted butter             (Fredoka h1)
         454 g                     (small ink-soft)
         Dairy                     (small ink-soft)
[ CHECK A PRICE ]  primary -> /check/:itemId
Usual price  $5.94 (PriceText lg)  +  $13.08/kg (small)
[90-day low] [90-day high]         two sunken stat tiles (unit prices)

Section "Price history"  [Per kg | Package]   (two Chips as a segmented control; label "Per kg"/"Per L"/"Each"/"Per dozen" by unit)
  PriceHistoryChart (focus follows a tapped legend chip)
  legend: 4 store Chips with tile-colour dots; tap focuses that store, tap again clears

Section "Right now"
  4 rows, cheapest unit price first: store dot + name, current price (PriceText md), unit price small,
  VerdictBadge for that price (tierFor((unit - avgUnit90) / avgUnit90)), pills "On sale" / "Live price"
  tapping a row runs useRunCheck().run({ itemId, retailerId, price: currentPrice, sizeQty: currentSizeQty, source: "flyer" })

Section "Prices near you"
  <NearbyPrices itemId limit={6} />

Section "How often it's on sale"
  per store: name, <SaleStreak points={that store's history} />, "{n} of 12 weeks"
  if any store >= 6 of 12: Card with PennyFace suspicious 40px:
  "{Store} runs this 'sale' most weeks. Treat the sale price as the real price."

<DataFreshness />
```
- Usual price per package = `avgUnit90 × item.sizeQty`.
- Loading: Skeletons for header, chart (240px), rows. Error: `<EmptyState mood="sad" title="Couldn't load this item" body="Check your connection and try again." action={<Button onClick={refetch}>Try again</Button>} />`. Unknown id (error message "Item not found"): EmptyState "Penny can't find that item." with `<LinkButton to="/check">Back to search</LinkButton>`.

## Acceptance
- [ ] Works for butter (forever-sale note shows), yogurt (size change), pasta (multi-buy), and a per-kg produce item.
