# SCR-01: Landing hero demo + ShelfTag

| | |
|---|---|
| Suggested agent | Claude / Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-01.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-01**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/landing/HeroDemo.tsx`
- `src/pages/landing/ShelfTag.tsx`

## Goal
The landing page hero demo: a realistic shelf tag you can check right there, with Penny reacting. It is the landing page's single orchestrated motion moment.

## Contract
- `src/pages/landing/HeroDemo.tsx`: `export function HeroDemo()` (no props). LandingPage (SCR-02) places it in the right column of the hero (below the copy on mobile).
- `src/pages/landing/ShelfTag.tsx`: `export function ShelfTag(props: { price: number; wasPrice?: number; multiBuy?: MultiBuy; name: string; sizeLabel: string; sale?: boolean; size?: "sm" | "lg"; tilt?: number; className? })`, a reusable markup shelf tag.

## ShelfTag
- Built in markup, not an image. Bright `bg-normal` rectangle, `rounded-sm`, 4px `normal-lip` bottom lip (`.press`-style box-shadow but not pressable).
- `sale`: a white strip across the top with "SALE" in Fredoka 700 `text-high`.
- Price in huge Fredoka 700 ink (`lg`: 64px, `sm`: 32px), cents raised; "was $8.49" crossed out beside or under it in Nunito 800 ink-soft (diagonal 2px line, not text-decoration); multi-buy renders "2 for $5.00".
- Item name and size underneath in Nunito 800; a tiny fake barcode (8–12 thin ink bars of varied width as divs) bottom-right.
- `tilt` in degrees (default 0) applied as rotation.

## HeroDemo behaviour
- Shows `<ShelfTag size="lg" sale price={5.99} wasPrice={8.49} name="Salted butter" sizeLabel="454 g" tilt={-3} />` with `<Penny mood="suspicious" />` overlapping its top-right corner (140px desktop, 100px mobile).
- Below: `<Button>Check this tag</Button>`. On click: `api.getFeatured()` → find `feat-butter` (fallback: the first deal) → `api.checkPrice({ itemId, retailerId, price, wasPrice, multiBuy, sizeQty, source: "flyer" })`. While running: Penny `thinking`, button `loading`, for at least 900ms even if the API is faster.
- Result: tag straightens to 0° (`spring.pop`); Penny switches to `tierMeta[tier].mood`, then to `suspicious` 700ms later if there are tricks; an inline result card pops in under the tag with `<VerdictBadge size="md" />`, `pennyLineFor(verdict)`, and a `<TrickCard compact />` per trick; then a LinkButton (variant ghost) "Try it on your own groceries" → `/check`, and a ghost Button "Check again" that resets.
- Do **not** navigate or save to recent checks; this is a self-contained demo.
- Error: Penny `sad`, small text "Couldn't check that tag. Tap to try again." Button stays usable.
- Reduced motion: no tilt animation (just snap), fades only.

## Acceptance
- [ ] Demo works end to end with the mock API and resets cleanly.
- [ ] Tag looks like a real, slightly playful BC shelf tag; nothing generic.
