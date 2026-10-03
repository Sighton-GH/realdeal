# SCR-12: NearbyPrices + SaleStreak

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-12.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-12**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/domain/NearbyPrices.tsx`
- `src/components/domain/SaleStreak.tsx`

## Goal
Two domain components: the nearby store prices list and the sale streak squares.

## Contract
- `NearbyPrices(props: { itemId: string; checkedPrice?: { retailerId: RetailerId; unitPrice: number }; limit?: number; title?: string; className? })`
- `SaleStreak(props: { points: PricePoint[] /* one retailer, oldest first */; weeks?: number; className? })`

## NearbyPrices
- `useUserLocation()` for `point`, `source`, `status`, `request`. Query: `useQuery(["nearby", itemId, lat.toFixed(3), lng.toFixed(3), limit], () => api.getNearbyPrices(itemId, point, limit ?? 6))`.
- Wrapped in `Section` with `title` (default "Prices near you"). Section action when `source === "default"`: ghost button with `Crosshair` icon, "Use my location", calls `request()`, shows `loading` while `status === "locating"`.
- Under the header (small ink-soft): GPS → "Near your location"; denied → "Location is off, so we're showing stores near SFU Burnaby."; unavailable → "Location isn't available here, so we're showing stores near SFU Burnaby."; default → "Showing stores near SFU Burnaby."
- Rows, nearest first, each `.lifted rounded-md` button, min height 72:
  - Left: 12px dot in the store tile colour; branch name (Nunito 800, truncate); next line address (truncate) and distance (`formatDistance`) in small ink-soft.
  - Right: `PriceText size="md"` package price, unit price beneath in small, `VerdictBadge size="sm"`.
  - Pills under the name when relevant: "On sale", "2 for $5.00" (multi-buy), "Live price", "Chain price" (ink-soft; `title` tooltip "We don't have this branch's own price, so this is the chain's usual price").
  - With `checkedPrice`: rows from the same chain get `bg-grape-50`; rows at least 3% cheaper per unit get a steal-tint pill "{money} cheaper" (per package difference).
  - End with a `MapPin` icon. Tap opens `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` in a new tab.
- Loading: 3 Skeleton rows (72px). Empty: small ink-soft "No stores found near you." Error: "Couldn't load nearby prices." + ghost "Try again".

## SaleStreak
- Row of rounded squares (14px, `rounded-[4px]`, 4px gap) for the latest `weeks` (default 12) points, oldest left.
- On sale: `bg-grape-500`. Regular: `bg-sunken` with 1.5px `line` border. Multi-buy: `bg-grape-500` with a 4px white centre dot.
- `title` on each square: "{formatWeek(date)}: {money}{, on sale}". Container `aria-label`: "On sale {n} of the last {weeks} weeks".
- Intentionally looks like a Duolingo streak calendar.

## Acceptance
- [ ] Works with the default location and after granting GPS on a phone (HTTPS).
- [ ] Pills and "cheaper" highlighting are correct.
