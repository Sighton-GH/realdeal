# ART-04: Item illustrations: pantry and produce (18)

| | |
|---|---|
| Suggested agent | Claude / Gemini |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/ART-04.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **ART-04**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/art/items/pantryProduce.tsx`

## Goal
Flat item illustrations for pantry and produce, matching ART-03 and Penny.

## Contract
- Export `PANTRY_PRODUCE_ART: ArtSet` from `src/components/art/items/pantryProduce.tsx` (types from `./types`).
- Each drawing returns only a `<g>` for a **64x64 viewBox**; no background (ItemArt adds it).
- Keys: `pasta` (bundle of spaghetti with a paper band), `rice` (bag with a window showing grains), `oil` (bottle with handle), `jar` (jar with lid, contents tan), `can` (tin can with a label band), `carton` (tall broth carton, distinct from milk), `banana` (bunch of 3), `apple`, `carrot` (with leafy top), `potato`, `onion`, `tomato` (with stem star), `lettuce` (romaine heart), `berries` (strawberry), `broccoli`, `cucumber`, `avocado` (halved, with pit), `generic` (shopping basket).

## Style rules (identical to ART-03; follow exactly)
- Flat, **no outlines**, no gradients, no decorative strokes.
- Max 3 tones per object: base, hard-edged shade on the lower-right, small hard-edged highlight upper-left.
- ~70% of the box, centred, baseline y≈54, chunky, rounded corners.
- Palette: neutrals `#FFFFFF`, `#F6F4FA`, `#D6CFE3`, `#241B35`; greens `#22A93F` / `#17802E` / `#7CD68B`; reds `#F23D3D` / `#C22424`; banana `#FFD43B` / `#E0A800`; orange `#FF7A1A` / `#D45A00`; tans `#E8C27A` / `#B88A3E`; purple onion skin `#8A5CF6` / `#6337D6` (or a golden onion `#E8A33D` / `#B5741F`). No text.

## Acceptance
- [ ] 18 drawings, each recognisable at 40px; `generic` works as a neutral fallback.
- [ ] Indistinguishable in style from ART-03's set when shown side by side.
