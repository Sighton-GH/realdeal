# SCR-17: 404 + error screen

| | |
|---|---|
| Suggested agent | any |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-17.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-17**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/system/NotFoundPage.tsx`
- `src/pages/system/ErrorScreen.tsx`

## Goal
The 404 page and the app-wide error screen.

## Contract
- `src/pages/system/NotFoundPage.tsx`: `export function NotFoundPage()` (rendered inside AppShell).
- `src/pages/system/ErrorScreen.tsx`: `export function ErrorScreen(props: { error?: unknown })` (rendered by the top-level error boundary, outside the router, so **don't use router hooks or `Link`**; use plain `<a href>` / `window.location`).

## Requirements
- **404**: `useTopBar({})`. Centred `EmptyState` with Penny `meh`: title "This aisle doesn't exist", body "The page you're looking for isn't here.", action `<LinkButton to="/check">Back to Check</LinkButton>`. Add a small row of 3 ItemArt drawings below (`milk`, `bread`, `banana`) at 40px, slightly rotated, like items knocked off a shelf.
- **Error screen**: inside `AppColumn`. Penny `sad` 140px, h1 "Something broke", body "RealDeal hit an unexpected error. Reload to try again.", primary `Button` "Reload" (`window.location.reload()`), secondary styled `<a href="/check">` "Back to Check" using `buttonClass({ variant: "secondary" })`. In dev (`import.meta.env.DEV`), show the error message and stack in a `bg-sunken rounded-sm` box, `text-micro`, scrollable.

## Acceptance
- [ ] Error screen works even if the router has crashed.
