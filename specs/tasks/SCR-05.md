# SCR-05: Price entry flow (3 steps)

| | |
|---|---|
| Suggested agent | Gemini / Claude |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-05.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-05**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/check/PriceEntryPage.tsx`
- `src/pages/check/entry/StepStore.tsx`
- `src/pages/check/entry/StepPrice.tsx`
- `src/pages/check/entry/StepExtras.tsx`
- `src/pages/check/entry/entryState.ts`
- `src/pages/check/entry/EntryHeader.tsx`

## Goal
The three-step price entry flow at `/check/:itemId`: pick the store, enter the price, add extras, check. It should feel like a quick Duolingo lesson.

## Contract
- `src/pages/check/PriceEntryPage.tsx`: `export function PriceEntryPage()`. Sub-components go in `src/pages/check/entry/` using only the file names listed under "Files you return" (never `PriceKeypad.tsx`).
- Imports `PriceKeypad` and `parsePriceInput` from `./entry/PriceKeypad` (SCR-06): `PriceKeypad({ value: string; onChange(v: string); hint?: string })`, `parsePriceInput(v: string): number`.
- Uses `useRunCheck` from `@/pages/check`, `useTopBar` with `{ hidden: true }` (this page draws its own lesson-style header).

## Layout
- Own header: close IconButton `X` (→ `/check`), `ProgressBar` (1/3, 2/3, 3/3), no bottom nav (AppShell already hides it here).
- Item header on every step: `ItemArt` 56px, name (h1 size Fredoka), size label. Load with `api.getItem(itemId)` (react-query). Unknown item: `<EmptyState mood="sad" title="Penny can't find that item." action={<LinkButton to="/check">Back to search</LinkButton>} />`.
- Steps slide horizontally with `stepSlide` from `@/lib/motion` (AnimatePresence, mode "wait").

## Steps
1. **"Where are you shopping?"** 2×2 grid of `StoreTile size="lg"` in `RETAILERS` order. Tap selects (others get `className="opacity-60"`), plays `tap`, advances after 250ms.
2. **"What's the price on the tag?"** `<PriceKeypad value onChange hint />` with hint "Enter the price per kg." for per-kg items (`unit === "kg" && sizeLabel === "per kg"`). `Continue` button disabled until `parsePriceInput(value) > 0`.
3. **"Anything else on the tag?"** Summary row: mini store tile + `PriceText`; tapping it jumps back to step 1 or 2. Three `Toggle`s that expand inline fields when on:
   - "There's a 'was' price" → `TextField` label "Was price", prefix `$`, `inputMode="decimal"`.
   - "It's a multi-buy deal" → `Stepper` (2–6, label "How many") + `TextField` label "For", prefix `$`; show "{money} each" beneath.
   - "The package size is different" (description "Shrinkflation check: enter the size printed on this package.") → `TextField` with suffix from the unit (kg items: "g"; L items: "mL"; each: "pack"; dozen: hide this toggle). Convert g→kg and mL→L before submitting.
   - Pinned bottom: `<Button fullWidth>Check price</Button>` → `run({ itemId, retailerId, price, wasPrice, multiBuy, sizeQty, source: "manual" })`, `loading` while running; show `error` from the hook in a toast.
- Validation: was price ≤ price → field error "The 'was' price should be higher than the price."; multi-buy total must be > 0.
- **Prefill** from query: `?store=saveon&price=5.99&was=8.49&mbq=2&mbt=5&size=0.5` (size in the item's unit). If store and price are present, open on step 3 with toggles pre-enabled for any provided extras.
- Back behaviour: the system back gesture/button goes to the previous step when on step 2 or 3 (keep the step in the URL as `?step=2` so browser back works).

## Acceptance
- [ ] All 3 steps, prefill, validation, and the final check landing on `/reveal/:checkId`.
- [ ] Nothing waits on the network except the final check (item load aside).
