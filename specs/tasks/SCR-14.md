# SCR-14: Scan screen (viewfinder, reading, failures)

| | |
|---|---|
| Suggested agent | Gemini / Claude |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-14.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-14**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/scan/ScanPage.tsx`
- `src/pages/scan/Viewfinder.tsx`
- `src/pages/scan/ReadingOverlay.tsx`
- `src/pages/scan/FailurePanel.tsx`
- `src/pages/scan/StoreHint.tsx`
- `src/pages/scan/parts/**` (any files inside this folder)

## Goal
The scan screen at `/scan`: a native-feeling camera viewfinder for snapping a shelf tag in the store, the "reading" state, and every failure path.

## Contract
- `src/pages/scan/ScanPage.tsx`: `export function ScanPage()`. Sub-components in `src/pages/scan/` (e.g. `Viewfinder.tsx`, `ReadingOverlay.tsx`, `FailurePanel.tsx`, `StoreHint.tsx`), but **not** `useCamera.ts`, `captureFrame.ts`, `ScanConfirmSheet.tsx`, or `SampleSheet.tsx`.
- Imports (contracts in CONTEXT): `useCamera` (SCR-13), `captureFrame`/`prepareImageFile` (SCR-13), `ScanConfirmSheet({ open, result, fallbackRetailerId, onRetake, onClose })` and `SampleSheet({ open, onClose, onPick(id, src) })` + `SAMPLES` (SCR-15).
- Call `useTopBar({ hidden: true })`; you draw a transparent overlay top bar. AppShell already hides the bottom nav here.

## Flow
1. **Viewfinder** (camera `live`): `<video>` fills the column, `object-cover`, on `bg-ink`. Overlay top bar: close `X` (→ back), "Scan a price tag" in white Fredoka 600, torch toggle (`Flashlight`) if supported, overflow IconButton (`DotsThreeVertical`) with "Try a sample tag".
   - Guide frame: rounded rect, aspect 4:3, ~80% of column width, centred slightly above middle, with chunky white corner brackets (4px, rounded). Outside darkened `bg-ink/55` via an SVG mask cut-out (no blur).
   - `<Penny mood="idle" size={72} />` bottom-left of the frame with `<SpeechBubble>Fit the whole tag inside the box.</SpeechBubble>`.
   - Store hint row above the controls: if `useUserLocation().source === "gps"`, `api.getNearbyPrices("milk-2pct-4l", point, 1)`; if the nearest branch is within 0.3 km, a preselected chip "At {branch name}?". Otherwise a chip "Which store?" that opens a small Sheet with the 4 chains (`StoreTile size="md"`), plus a small link "Use my location" calling `request()`. The chosen retailer becomes `fallbackRetailerId` for the confirm sheet.
   - Controls: left "Photos" (`Image` icon; hidden `<input type="file" accept="image/*">` → `prepareImageFile`), centre shutter (76px white circle inside a 6px white ring with 4px gap; presses down 4px), right "Type it" (`Keyboard`) → `/check?focus=search`.
   - Shutter: white flash overlay 80ms, `play("pop")`, `captureFrame(video, guideRectInElementCoords)`, freeze that image on screen (object URL), go to Reading.
2. **Reading**: frozen photo dimmed; a flat 4px grape-400 scan line sweeps top→bottom inside the frame on a loop; Penny `thinking` + "Reading the tag…". `api.scanImage(blob, sampleId?)`. Cancel returns to the viewfinder and ignores the late result.
3. **Confirm**: `status === "ok"` → open `ScanConfirmSheet` over the frozen photo.
4. **Failures** (`FailurePanel` with Penny):
   - `no_price`: `meh`, "Penny couldn't find a price in that photo. Try a closer shot of the tag, or type it in." Buttons `Retake`, `Type it in` (→ `/check/:itemId?store=…` if a candidate was found, else `/check?focus=search`).
   - `error` / network: `sad`, "Couldn't read that photo right now." Buttons `Try again` (resend the same blob), `Type it in`.
   - Camera `denied`: `sad`, "RealDeal needs the camera to read price tags. Allow camera access in your browser settings, or pick a photo instead." Buttons `Pick a photo`, `Type it in`.
   - `unavailable` / `insecure`: `meh`, "Your camera isn't available here. Pick a photo instead, or try a sample tag." Buttons `Pick a photo`, `Try a sample tag`.
5. **Samples**: "Try a sample tag" opens `SampleSheet`; picking one shows its image as the frozen photo and calls `api.scanImage(null, id)`.
- Start the camera on mount; stop on unmount (the hook handles it).
- Revoke object URLs when replaced.
- Reduced motion: no sweep (static "Reading…").

## Acceptance
- [ ] Rear camera works on a phone over HTTPS; samples work on a laptop with no camera, end to end to the reveal.
- [ ] Every failure path offers a way forward.
