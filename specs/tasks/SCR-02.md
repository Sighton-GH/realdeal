# SCR-02: Landing page sections

| | |
|---|---|
| Suggested agent | Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-02.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-02**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/landing/LandingPage.tsx`
- `src/pages/landing/VerdictBand.tsx`
- `src/pages/landing/TricksRows.tsx`
- `src/pages/landing/DataNote.tsx`
- `src/pages/landing/LandingFooter.tsx`
- `src/pages/landing/sections/**` (any files inside this folder)

## Goal
The rest of the landing page at `/`: header, hero copy, verdict band, tricks rows, data note, and footer. Full width (no app shell).

## Contract
- `src/pages/landing/LandingPage.tsx`: `export function LandingPage()`.
- Imports `HeroDemo` from `./HeroDemo` (SCR-01; `export function HeroDemo()`, no props, about 420px wide).
- Other section files you create live in `src/pages/landing/` (e.g. `VerdictBand.tsx`, `TricksRows.tsx`, `DataNote.tsx`, `LandingFooter.tsx`).

## Layout (content `max-w-[1120px] mx-auto px-5`)
```
DESKTOP
| [Logo]                                    [Check a price]   |
| Is that sale actually      |   [HeroDemo]                   |
| a deal?                    |                                |
| (body)                     |                                |
| [CHECK A PRICE] [SCAN...]  |                                |
| ===== grape-900 band: "Four answers. No maybes." =========== |
| "The tricks Penny catches": 4 alternating rows              |
| sunken band: "Where the numbers come from"                  |
| footer                                                      |
```
Mobile: single column; hero text centred, HeroDemo below.

## Sections and copy (verbatim)
- **Header**: `<Logo size="md"/>` left; `<LinkButton to="/check" variant="secondary" size="md">Check a price</LinkButton>` right. Not sticky.
- **Hero**: h1 = `TAGLINE` in `text-display` (4rem at md+), no highlighted word. Body (`max-w-[44ch] text-h3 font-semibold text-ink-soft`): "RealDeal checks a grocery price against 90 days of prices at four BC stores and tells you in seconds: steal, good deal, normal, or overpriced." Buttons: `Check a price` → `/check`; secondary `Scan a price tag` with `Scan` icon → `/scan`. Then `<HeroDemo />`.
- **Four answers** (full-bleed `bg-grape-900`, white text, `py-20`): h2 "Four answers. No maybes." (Fredoka 600, h1 size). Sentence (white/80): "Every price is compared with its 90-day average across Save-On-Foods, No Frills, Walmart and T&T, per kg or per litre so package sizes can't hide anything." Then a horizontal strip of 4 segments in tier face colours sized by range (steal 25%, good 15%, normal 20%, high 40% of width), each with the verdict word (white Fredoka 600; ink on normal) and its rule beneath in small text: "25%+ below average", "10–25% below", "within 10%", "10%+ above". Mobile: vertical stack.
- **Tricks** (`py-20`): h2 "The tricks Penny catches". Four rows (not a card grid), alternating left/right alignment on desktop. Each: 56px tile in a tier face colour (steal, good, normal, high in that order) with a white Phosphor icon (`Infinity`, `TagSimple`, `Copy`, `ArrowsIn`), name (h3), one sentence, example in small ink-soft:
  - Forever sale: "If it's on sale most weeks, the sale price is just the price." / "Butter at Save-On: on sale 10 of the last 12 weeks."
  - Inflated "was" price: "A struck-out price nobody actually paid." / "Was $8.49? It sold for that 4 weeks out of 26."
  - Multi-buy trap: "Buy two, save almost nothing." / "2 for $5 spaghetti saves 9¢ a box."
  - Shrinkflation: "Same price, less food." / "Greek yogurt went from 650 g to 500 g. Price didn't move."
  - Then `<LinkButton to="/tricks" variant="ghost">See how each trick works</LinkButton>`.
- **Data note** (`bg-sunken py-16`): h2 "Where the numbers come from"; two paragraphs (`max-w-[60ch]`): "We track weekly shelf prices for 40 everyday groceries at four BC stores, using public price data from Project Hammer and prices collected from the stores' own websites." / "RealDeal is a prototype. Prices can be out of date, so treat a verdict as a strong hint, not a guarantee." Then `<DataFreshness />`.
- **Footer**: `<Logo size="sm"/>`, "Built at StormHacks 2026 at SFU.", and a "Check a price" link. 2px `line` top border.
- No load or scroll animations anywhere on this page (HeroDemo owns the only motion).

## Acceptance
- [ ] Looks deliberate at 390px and 1440px; no 3-column card grid, gradients, emoji, uppercase eyebrows, or arrows in labels.
- [ ] Copy matches exactly.
