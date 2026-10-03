# SCR-08: Reveal result panel

| | |
|---|---|
| Suggested agent | Gemini / Claude |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-08.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-08**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/reveal/RevealResult.tsx`
- `src/pages/reveal/result/**` (any files inside this folder)

## Goal
The white result panel on the reveal: Penny's line, the numbers, savings, cheaper elsewhere, a compact price chart, nearby store prices, tricks, and actions.

## Contract
- `src/pages/reveal/RevealResult.tsx`: `export interface RevealResultProps { verdict: Verdict; onReplay: () => void }`, `export function RevealResult(props)`. Sub-components in `src/pages/reveal/result/`.
- RevealPage (SCR-07) renders this inside a scrolling white panel; you render the content with `px-5 pt-6 pb-10` and `gap-6`.
- Uses domain components (props in CONTEXT): `PriceGauge`, `TrickCard`, `PriceHistoryChart`, `NearbyPrices`, `SpeakButton`.

## Content, in order
1. **Penny says**: `PennyFace` 48px beside `<SpeechBubble tail="left">{pennyLineFor(verdict)}</SpeechBubble>`; below it `<SpeakButton text={pennyLineFor(verdict)} />`.
2. **The numbers**: `Card` with two columns: "You'd pay" + `PriceText size="lg" amount={unitPrice} unit={item.unit}`; "Usual price" + avg unit price. Below: `<PriceGauge pctVsAvg tier animate />`. Under it, small ink-soft: "90-day range {formatUnitPrice(low90)} to {formatUnitPrice(high90)}".
3. **Savings** (h3): `savingsVsAvg > 0.005` → "You save {money} vs the usual price."; `< -0.005` → "You'd pay {money} more than usual."; else "Right at the usual price." (money = absolute value, `formatMoney`).
4. **Cheaper elsewhere** (only if `best.retailerId !== input.retailerId` and best unit price is at least 3% below yours): `Card` with a store-colour dot: "{retailer name} has it for {formatMoney(best.price)} right now."
5. **Penny noticed** (only if tricks): `Section` title "Penny noticed", then `TrickCard`s with `index` for the stagger.
6. **Price history**: `Section` title "Price history", action ghost "Full history" → `/item/:itemId`. `useQuery(["item", itemId], () => api.getItem(itemId))`; Skeleton 140px while loading; then `<PriceHistoryChart detail mode="unit" focusRetailer={input.retailerId} compact markPrice={unitPrice} markTier={tier} />`.
7. **Nearby**: `<NearbyPrices itemId checkedPrice={{ retailerId: input.retailerId, unitPrice }} limit={4} title="Prices near you" />`.
8. **Actions**: `<LinkButton to="/check" fullWidth>Check another</LinkButton>`, `<LinkButton to={"/item/" + itemId} variant="secondary" fullWidth>See price history</LinkButton>`, ghost `Button` "Replay" → `onReplay`.

Sections 1–3 appear immediately; 4–8 can fade in 150ms after (no fancy motion; the reveal already did the drama).

## Acceptance
- [ ] Every number formatted via `@/lib/format`; content matches the verdict exactly for all six featured deals.
- [ ] Panel reads clearly top to bottom at 390px.
