# ART-02: Logo wordmark + favicon

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/ART-02.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **ART-02**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/penny/Logo.tsx`
- `public/favicon.svg`

## Goal
The wordmark logo and the favicon.

## Contract
- `Logo(props: { size?: "sm" | "md" | "lg"; onDark?: boolean; className? })`
- Uses `PennyFace` from `./PennyFace` (props `{ mood?, size?, className? }`) and `BRAND_NAME` from `@/lib/brand`.

## Requirements
- `<PennyFace size={24|32|44} />` + `BRAND_NAME` in Fredoka 700 at 18/24/36px for sm/md/lg; 8px gap; ink text, or white when `onDark`. One wordmark: no space inserted, no colour split, no accented letters.
- Add a subtle, deliberate typographic detail that makes the wordmark ownable (pick one): slightly tighter tracking (-0.01em) with the "D" nudged up 1px, or the dot-free baseline aligned to Penny's mouth line. Keep it restrained.
- `aria-label` = BRAND_NAME on the wrapper; PennyFace inside is `aria-hidden`.
- `public/favicon.svg`: Penny's face (idle) on a transparent background, built to be crisp at 32px and 16px: simplify (coin, rim, two eyes, smile; drop cheeks and shine at this size). Same colours as ART-01: copper `#E0793C`, rim `#B5561F`, ink `#241B35`, white eyes.

## Acceptance
- [ ] Logo is crisp and balanced in all three sizes on white and on grape-900.
- [ ] Favicon reads clearly in a browser tab.
