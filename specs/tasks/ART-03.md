# ART-03: Item illustrations: dairy and bakery (11)

| | |
|---|---|
| Suggested agent | Claude / Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/ART-03.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **ART-03**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/art/items/dairyBakery.tsx`

## Goal
Flat item illustrations for dairy and bakery products, in the same hand as Penny.

## Contract
- Export `DAIRY_BAKERY_ART: ArtSet` from `src/components/art/items/dairyBakery.tsx` (types from `./types`: `ArtDrawing = () => ReactElement`, `ArtSet = Partial<Record<ArtKey, ArtDrawing>>`).
- Each drawing returns only a `<g>` of shapes for a **64x64 viewBox**. ItemArt (ART-05) provides the `<svg>` and the rounded backdrop, so don't draw a background.
- Keys to draw: `milk` (gable-top carton), `eggs` (open carton showing 3 eggs), `butter` (brick half-unwrapped), `cheese` (wedge with holes), `yogurt` (tub with a lid), `sourcream` (shorter tub, different lid colour from yogurt), `flour` (paper sack with folded top), `bread` (loaf with scored top), `bagel` (bagel with seeds), `sugar` (bag, distinct from flour), `oats` (round canister).

## Style rules (shared with ART-04; follow exactly so the sets match)
- Flat, **no outlines**, no gradients, no strokes except where a shape is inherently a line (e.g. a carton crease, 2px, same colour family).
- Max 3 tones per object: base, shade (hard-edged band or crescent on the lower-right side), highlight (small hard-edged shape on the upper-left).
- Objects fill about 70% of the 64x64 box, centred, sitting on an implied baseline at y≈54. Slightly chunky, rounded corners (r 3–6).
- Palette: neutrals `#FFFFFF`, `#F6F4FA`, `#D6CFE3`, `#241B35`; bread/flour cream `#FFE7B8` with shade `#E8C27A`; dairy blues `#1890E0` / `#0E6DAD` / `#E1F1FC`; butter yellow `#FFC21A` / `#D69A00`; accents from the store tile colours `#FF7A1A`, `#F2428F`, `#12A89E`, `#8A5CF6`. No text inside drawings.

## Acceptance
- [ ] 11 drawings, each instantly recognisable at 40px.
- [ ] Consistent light direction (upper-left) and shading style across all of them.
