# SCR-11: Price history chart (d3 + SVG)

| | |
|---|---|
| Suggested agent | Claude / Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-11.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-11**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/domain/PriceHistoryChart.tsx`
- `src/components/domain/chart/**` (any files inside this folder)

## Goal
The price history chart: hand-built SVG with `d3-scale` and `d3-shape` (no chart library).

## Contract
- `PriceHistoryChart(props: { detail: ItemDetail; mode: "unit" | "package"; focusRetailer?: RetailerId; compact?: boolean; markPrice?: number; markTier?: VerdictTier; className? })` in `src/components/domain/PriceHistoryChart.tsx`. Internal helpers may go in `src/components/domain/chart/`.
- `markPrice` is in the current mode's units (unit price in "unit" mode).

## Requirements
- Width = container (ResizeObserver); height 240 (280 at ≥768px); `compact` 140.
- X: `scaleTime` over the history dates. Y: `scaleLinear` over unit price (`unitPriceOf(price, sizeQty, multiBuy)`) or package price (effective price), `.nice()`, starting near the data minimum, not zero. Include `markPrice` in the domain.
- Zone bands relative to `stats.avgUnit90` (× `item.sizeQty` in package mode): ≤ −25% `fill-steal-tint`, −25% to −10% `fill-good-tint`, ±10% none, > +10% `fill-high-tint`. Flat fills, labelled at the right edge in micro ink-soft ("steal", "good", "high") except in compact.
- Dashed ink-soft line at the average, labelled "usual".
- One line per retailer (chain-level points only; ignore points with `storeId`), `curveMonotoneX`, 3px, round caps, stroke in the store tile face colour (`var(--color-tangerine)` etc., from `retailerById(id).tile`). Sale weeks: filled circle r 4 on the line. Multi-buy weeks: 7px square.
- `focusRetailer`: that line full opacity; others 25%.
- `markPrice` + `markTier`: solid 3px horizontal line in the tier face colour across the plot, with a pill at the right edge reading "You" (tier face background; white text, ink on normal).
- Interaction: pointer move/tap shows a vertical ink guide and a tooltip card (`.lifted bg-canvas rounded-sm p-3`) with the week (`formatWeek`) and each store's price that week ("On sale", "2 for $5.00" where relevant). Touch: tap to pin, tap elsewhere to clear. Keyboard: the SVG is focusable; left/right arrows move the week.
- Axes: Y labels left in small ink-soft (`$13`); X labels as short months ("Apr", "May"). 3 faint horizontal gridlines in `line`. Compact: no Y labels, first and last month only, no zone labels.
- Lines draw in left→right once on mount (stroke-dashoffset, 700ms). Nothing else animates. Static under reduced motion.
- `role="img"` with a summary `aria-label` (e.g. "Price per kg over 26 weeks at 4 stores; lowest $11.21 at No Frills") plus a visually hidden data table.

## Acceptance
- [ ] Correct for per-kg produce, package items, the shrinking yogurt (visible jump in unit mode), and multi-buy pasta.
- [ ] Tooltip works with mouse, touch, and keyboard; no chart library imported.
