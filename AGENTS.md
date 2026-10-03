# AGENTS.md: rules for every agent working on RealDeal

Agents with repo access (Claude Code, Gemini CLI, Codex) follow this file directly. Chat-only agents get the same rules through `specs/context/CORE.md`; see `specs/README.md`.

RealDeal is a mobile-first web app that tells shoppers whether a grocery price is a good price. It compares the unit price to a 90-day average across 4 stores, returns one of 4 verdicts (steal, good, normal, high), and flags pricing tricks. The frontend is the product and must look polished, playful, and hand-made: Duolingo's chunky tactility plus Kahoot's game-show reveal. Read DESIGN.md before touching any UI.

## Stack (already installed by SPEC-00; do not add dependencies)

- Vite 8 + React 19 + TypeScript 6 (strict). react-router 8 in declarative mode (`BrowserRouter`, `Routes`, `Route`, imported from `"react-router"`).
- Tailwind CSS **v4** via `@tailwindcss/vite`. Tokens live in `src/styles/theme.css` inside `@theme { }`. **There is no `tailwind.config.js`. Never create one. Never write v3 syntax** (`@tailwind base` etc.).
- Motion: the `motion` package, imported as `import { motion, AnimatePresence } from "motion/react"`.
- Icons: `@phosphor-icons/react` only (weight `bold` by default, `fill` for active/selected).
- State: `zustand` (`src/store/useAppStore.ts`). Data fetching: `@tanstack/react-query`.
- Charts: `d3-scale` + `d3-shape` with hand-built SVG. Confetti: `canvas-confetti`.
- Fonts: `@fontsource/fredoka` and `@fontsource/nunito` (self-hosted; works offline on venue wifi).
- Server: `hono`, `@hono/node-server`, `@google/genai`, `pg`, run with `tsx`.
- Scrapers: `playwright` (Chromium) and `cheerio`, run with `tsx`.

If you truly need a new dependency, do not install it. Write it in BLOCKERS.md and work around it.

## Commands

- `npm run dev`: frontend on http://localhost:5173 (mock API by default)
- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`
- `npm run server`: live API + built frontend on http://localhost:8787 (BE-07)
- `npm run scrape`: collect current prices from store websites (BE-06)

## Folder map (who owns what is listed in each spec)

```
shared/            types.ts (frozen), retailers.ts, verdict.ts, seed/, content/
src/api/           client.ts (picks mock or live), mock.ts, live.ts
src/components/ui/        generic components (Button, Card, ...)
src/components/layout/    AppShell, TopBar, BottomNav
src/components/penny/     Penny mascot, Logo
src/components/art/       ItemArt illustrations
src/components/domain/    RealDeal-specific components (PriceGauge, TrickCard, ...)
src/pages/<area>/         one folder per screen area
src/lib/           brand.ts, format.ts, tier.ts, sfx.ts
src/store/         useAppStore.ts
server/            live API (BE-07)
scrapers/          store website scrapers + Hammer import (BE-06)
data/              generated price data (gitignored except data/README.md)
public/            static assets
```

## Golden rules

1. **Only create or edit the files your spec lists under "Files you own."** Everything else is read-only to you, including `package.json`, `src/App.tsx`, `src/routes.tsx`, `shared/types.ts`, `src/styles/theme.css`. If you need a change there, add an entry to `BLOCKERS.md` and work around it.
2. **Import types from `@shared/types`.** Never redefine or modify them. Call data only through `api` from `@/api/client`, never import `mock.ts` directly.
3. **Use the shared components** from `@/components/ui`, `@/components/layout`, `@/components/penny`, `@/components/art`, `@/components/domain`. Do not build your own buttons, cards, or badges. If a component is still a stub, use it anyway; its props are final.
4. **Colours, radii, fonts come from tokens only** (Tailwind classes generated from `theme.css`, e.g. `bg-grape-500`, `text-ink`, `rounded-md`, `font-display`). No raw hex values in components. Exception: SVG illustration files in `src/components/penny` and `src/components/art` may use the hex values listed in DESIGN.md.
5. **Every data screen handles loading, empty, and error states** using the patterns in DESIGN.md (Skeleton, EmptyState with a Penny mood).
6. **Mobile-first.** Design at 390px wide first, then check 1280px. Touch targets at least 48px.
7. **Accessibility floor:** semantic elements, visible focus ring (`focus-visible:` styles from DESIGN.md), `aria-label` on icon-only buttons, colour is never the only signal (verdicts always have a word), respect `prefers-reduced-motion` (use `useReducedMotion()` from `motion/react`).
8. **TypeScript strict.** No `any`, no `@ts-ignore`. No `console.log` left behind.
9. **Copy:** sentence case, Canadian spelling (colour, favourite), CAD prices formatted with `src/lib/format.ts`. Use the copy given in your spec verbatim where provided.
10. **Read DESIGN.md section 11 ("Never do this") before you start and again before you finish.**

## Working in parallel

Other agents are editing other files at the same time. If `npm run typecheck` or `build` fails in a file you don't own, it isn't yours: note it in your report, don't fix it. Make sure your own files are error-free.

## BLOCKERS.md format

```
- [SCR-03] Need `onClear` prop on SearchField (src/components/ui/SearchField.tsx) to show a clear button. Workaround: wrapped it with my own clear IconButton.
```

## Definition of done (repo agents)

- Everything in your spec's acceptance checklist is true.
- `npm run typecheck && npm run lint && npm run build` pass for your files.
- You opened your screens in a real browser at 390px and 1280px, compared them against DESIGN.md, and fixed mismatches. If you can take screenshots (Playwright or browser tools), do it and look at them critically before declaring done.

## Final report (reply with exactly this)

```
TASK-ID done
Files created/changed: ...
Works: ...
Stubbed / not wired: ...
Blockers logged: ...
Visually checked at 390px / 1280px: yes/no
```
