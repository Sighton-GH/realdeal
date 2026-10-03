# SCR-09: PriceGauge + TrickCard

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-09.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-09**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/domain/PriceGauge.tsx`
- `src/components/domain/TrickCard.tsx`

## Goal
Two domain components: the price gauge and the trick card.

## Contract
- `PriceGauge(props: { pctVsAvg: number; tier: VerdictTier; animate?; compact?; className? })`
- `TrickCard(props: { trick: TrickFlag; index?: number; compact?; className? })`

## PriceGauge
- Horizontal track 20px tall (`compact`: 12px), `rounded-full`, four segments in tier face colours. X maps pct from −50% to +50% (clamped). Boundaries at −25%, −10%, +10% (so widths 25/15/20/40%).
- Marker: white 28px circle with a 3px ink ring and a small downward ink pointer, sitting on the track at the pct position; a label above it in Fredoka 600 small showing the signed pct ("−31%", "+12%", or "avg" within ±0.5%).
- A thin white tick at 0 with "avg" in micro ink-soft beneath the track.
- `animate`: marker starts at 0 and springs to position (`spring.pop`) after 300ms. `compact`: no labels, 16px marker.
- `role="img"` with an `aria-label` like "31% below the 90-day average, in the steal range".
- Reduced motion: no spring, marker placed directly.

## TrickCard
- `.lifted rounded-md bg-canvas p-4` with a 6px `border-l-high` left stripe.
- Layout: 40px `bg-high-tint rounded-sm` tile with the trick icon in `text-high` (`perpetual_sale`: `Infinity`, `inflated_was_price`: `TagSimple`, `multibuy_trap`: `Copy`, `shrinkflation`: `ArrowsIn`; weight bold); title (Nunito 800 h3); detail (small ink-soft, `max-w-[44ch]`); `stat` as a pill on the right (`bg-high-tint text-high-lip` micro Nunito 800, no wrap).
- `compact`: icon tile 32px, title + stat only, single line.
- `index`: pops in with `spring.pop` from y 12, delay `index * 0.15s` (static under reduced motion).

## Acceptance
- [ ] Gauge is accurate at −50, −31, −25, −10, 0, +10, +27, +60%.
- [ ] Trick cards are readable and compact mode fits in one line at 390px.
