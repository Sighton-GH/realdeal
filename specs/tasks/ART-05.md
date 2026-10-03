# ART-05: ItemArt wiring + Penny playground (/dev/penny)

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/ART-05.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **ART-05**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/art/ItemArt.tsx`
- `src/pages/dev/PennyPlayground.tsx`

## Goal
Wire the two illustration sets into `ItemArt`, and build the Penny playground page.

## Contract
- `ItemArt(props: { artKey: ArtKey; size?: number /* px, default 64 */; className? })` in `src/components/art/ItemArt.tsx`.
- Imports `DAIRY_BAKERY_ART` from `./items/dairyBakery` and `PANTRY_PRODUCE_ART` from `./items/pantryProduce` (both `ArtSet`, each value a `() => <g>` for a 64x64 viewBox). Either set may be empty or missing keys while other agents work.
- `PennyPlayground()` in `src/pages/dev/PennyPlayground.tsx` (routed at `/dev/penny` in dev).

## Requirements
**ItemArt**
- Renders `<svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={readable name}>` with a backdrop `rect` (64x64, rx 16, `#F6F4FA`) and the drawing on top.
- Lookup order: the exact key in either set → a fallback map → `generic` → if even `generic` is missing, a simple built-in basket (two rounded rects and a handle arc in `#D6CFE3`/`#5E5670`).
- Fallback map: `sourcream→yogurt`, `bagel→bread`, `sugar→flour`, `oats→flour`, `oil→jar`, `carton→milk`, `tomato→apple`, `potato→generic`, `onion→generic`, `lettuce→generic`, `broccoli→generic`, `cucumber→generic`, `avocado→generic`.
- Readable names for aria-label (e.g. `milk` → "Milk", `sourcream` → "Sour cream").

**PennyPlayground**
- `useTopBar({ title: "Penny playground", back: true })`.
- All 9 moods at 120px in a grid on white, then the same on a `bg-grape-900` panel.
- One large Penny (240px) with a row of Chips to switch moods live.
- PennyFace at 24, 32, 48px; `Logo` in sm/md/lg on white and with `onDark` on grape-900.
- Every ArtKey (list them all from the `ArtKey` union) rendered with `ItemArt` at 64px with its key underneath, plus a row at 40px.

## Acceptance
- [ ] Every ArtKey renders something sensible even if the art sets are empty.
