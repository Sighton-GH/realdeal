# SCR-16: Trick Files page + trick copy

| | |
|---|---|
| Suggested agent | GLM / Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-16.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-16**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/content/tricks.ts`
- `src/pages/tricks/**` (any files inside this folder)

## Goal
The Trick Files page that explains each pricing trick, and the final trick copy.

## Contract
- `shared/content/tricks.ts`: `export const TRICKS: TrickInfo[]` (keep the name and `TrickInfo` shape).
- `src/pages/tricks/TricksPage.tsx`: `export function TricksPage()`; sub-components in `src/pages/tricks/`.

## Trick content
| type | name | oneLiner | howItWorks | howWeCatch | example |
|---|---|---|---|---|---|
| perpetual_sale | Forever sale | If it's on sale most weeks, the sale price is just the price. | Stores set a high "regular" price they rarely charge, then run the item "on sale" almost every week. The sale tag creates urgency for a price that's actually normal. | We count how many of the last 12 weeks the item was on sale at that store. Six or more and we call it out. | butter-salted-454g, saveon |
| inflated_was_price | Inflated "was" price | A struck-out price nobody actually paid. | The "was" price makes the discount look big. If the item almost never sold at that price, the saving is imaginary. | We check how often the item really sold at the "was" price in the last 26 weeks. Under a quarter of the time and we flag it, then show your real saving against the average. | butter-salted-454g, saveon |
| multibuy_trap | Multi-buy trap | Buy two, save almost nothing. | "2 for $5" sounds like a deal and gets you to buy more. Often the single price is only a few cents higher, or even the same. | We compare the per-item multi-buy price with that store's usual single price. A saving under 5% gets flagged. | spaghetti-900g, tnt |
| shrinkflation | Shrinkflation | Same price, less food. | The package gets smaller while the price stays put, so you pay more per gram without noticing. | We track package sizes week by week. If the package shrank 5% or more and the price per kg or litre went up, we flag it. | greek-yogurt-plain, walmart |

## Page (`useTopBar({})`, `px-5 py-6`)
- Header: `<Penny mood="suspicious" size={96} />` beside h1 "The Trick Files" and body ink-soft "Four ways a price tag can make a normal price look like a deal."
- Four accordion panels (one open at a time, first open by default). Header button: 48px `bg-high-tint` tile with the trick icon in `text-high` (`Infinity`, `TagSimple`, `Copy`, `ArrowsIn`), name (h3), oneLiner (small ink-soft), rotating `CaretDown`. `aria-expanded`/`aria-controls`. Height animates with `spring.sheet`.
- Expanded: "How it works" (Nunito 800 small) + `howItWorks`; a small explainer drawn in markup/SVG, unique per trick:
  - Forever sale: 12 squares like a streak row, 10 filled grape-500: "On sale 10 of 12 weeks".
  - Inflated "was" price: a mini tag "was $8.49" next to a tiny 26-bar chart where only 4 bars reach the $8.49 line.
  - Multi-buy trap: "2 for $5.00" tag next to a "1 for $2.59" tag, with "you save 9¢ each" between them.
  - Shrinkflation: two yogurt tubs as simple shapes, 650 g and a visibly shorter 500 g, both labelled $5.97.
  - Then "How Penny catches it" + `howWeCatch`, then `Button variant="secondary"` "Check a real example": `api.getFeatured()`, pick `feat-butter` (first two tricks), `feat-pasta`, or `feat-yogurt`, and `useRunCheck().run(...)` with `source: "flyer"`.
- Footer note (small ink-soft): "Tricks are flagged from weekly prices. A flag means 'look closer', not 'the store broke a rule'."

## Acceptance
- [ ] Four distinct explainers; examples land on the right reveal; accordion is keyboard accessible.
