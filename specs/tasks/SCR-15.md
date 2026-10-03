# SCR-15: Scan confirm sheet + sample tag images

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-15.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-15**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/scan/ScanConfirmSheet.tsx`
- `src/pages/scan/SampleSheet.tsx`
- `public/samples/**` (any files inside this folder)

## Goal
The scan confirmation sheet and the three sample tag images.

## Contract
- `src/pages/scan/ScanConfirmSheet.tsx`: `export interface ScanConfirmSheetProps { open: boolean; result: ScanResult; fallbackRetailerId?: RetailerId; onRetake: () => void; onClose: () => void }`, `export function ScanConfirmSheet(props)`.
- `src/pages/scan/SampleSheet.tsx`: `export type SampleId = "sample-butter" | "sample-yogurt" | "sample-pasta"`, `export const SAMPLES: Array<{ id: SampleId; src: string; label: string }>`, `export interface SampleSheetProps { open; onClose(); onPick(id: SampleId, src: string) }`, `export function SampleSheet(props)`.
- `public/samples/sample-butter.svg`, `sample-yogurt.svg`, `sample-pasta.svg`.

## ScanConfirmSheet (inside `Sheet` titled "Is this right?")
- Item: `ItemRow` for `result.candidates[0]` with a "Change" ghost action that reveals the other candidates as `Chip`s and a "Search instead" link → `/check?focus=search`. No candidates → a SearchField-style button "Pick the item" → `/check?focus=search`.
- Store: 2×2 `StoreTile size="md"`, preselected from `result.retailerId ?? fallbackRetailerId`; required.
- Price: `PriceText size="xl"` with an "Edit" link that swaps it to a `TextField` (prefix `$`, decimal). Lines for "was {money}", "{qty} for {money}", "Size: {formatSize}" when detected, each with an inline "Edit"/"Remove".
- Primary `Check price` → `useRunCheck().run({ itemId, retailerId, price, wasPrice, multiBuy, sizeQty, source: "scan" })`, `loading` while running. Secondary `Retake` → `onRetake`.
- Validate: item, store, and price > 0 required (disable the button until valid).

## SampleSheet
- Three thumbnails (`img` with `src`, 4:3, `rounded-md`, `.lifted`), label under each; tap → `onPick(id, src)` then `onClose()`.

## Sample tag artwork (800×600 SVGs, photographed-straight-on look)
- Grey shelf edge strip, an off-white tag with a generic coloured band (no real store logos or names), product name and size, big price, a small unit-price line, a barcode.
- `sample-butter.svg`: yellow SALE tag, "SALTED BUTTER 454 G", "$5.99", "WAS $8.49", "$13.19 / KG".
- `sample-yogurt.svg`: white regular tag, "PLAIN GREEK YOGURT 500 G", "$5.97", "$11.94 / KG".
- `sample-pasta.svg`: red multi-buy tag, "SPAGHETTI 900 G", "2 FOR $5.00", "REG. $2.59".
- Use system-safe fonts inside the SVG (`font-family="Arial, Helvetica, sans-serif"`), bold; slight shadow allowed here (it's a "photo") but keep it flat and simple.

## Acceptance
- [ ] Sheet prefills everything from the result and everything is editable.
- [ ] Sample SVGs look like real shelf tags at thumbnail and full size.
