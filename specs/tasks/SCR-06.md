# SCR-06: Price keypad

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-06.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-06**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/check/entry/PriceKeypad.tsx`

## Goal
The chunky on-screen price keypad and big price display for step 2 of price entry.

## Contract
- `src/pages/check/entry/PriceKeypad.tsx`:
  - `export interface PriceKeypadProps { value: string; onChange: (value: string) => void; hint?: string }`
  - `export function PriceKeypad(props: PriceKeypadProps)`
  - `export function parsePriceInput(value: string): number` ("" → 0, "5." → 5, "5.9" → 5.9)
  - `export function applyKey(value: string, key: string): string` (pure input rules; key is "0"–"9", ".", "back", "clear")
- `value` is the raw typed string; the parent owns state.

## Requirements
- Big display: `PriceText size="xl"` of the parsed value; when empty, show `$0.00` in `text-line-strong`. A blinking caret (2px grape-400 bar after the number; static under reduced motion). `aria-live="polite"` region announcing the value.
- Optional `hint` under the display in small ink-soft.
- Keypad: 3×4 grid (1–9, ".", 0, backspace `Backspace` icon). Keys are `.press` canvas tiles, 2px `line` border, `line-strong` lip, `rounded-md`, 64px tall, Fredoka 600 28px digits; 10px gap. Long-press backspace (500ms) clears all.
- Input rules: max 2 decimals, max value 999.99, one ".", no leading zeros ("05" → "5", but "0.5" allowed); "." first becomes "0.".
- Physical keyboard: digits, ".", ",", Backspace, Delete, Escape (clear) while the keypad is mounted.
- Each key plays `play("tap")`.

## Acceptance
- [ ] Typing via keypad and keyboard produces the same results; rules enforced.
- [ ] Unit tests are optional but `parsePriceInput` and the input-rule function must be pure and exported (`applyKey(value: string, key: string): string`).
