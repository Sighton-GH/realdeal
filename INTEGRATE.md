# INTEGRATE.md: instructions for Claude Code

You are integrating RealDeal. Dozens of AI agents each built one task from `specs/tasks/` against frozen contracts, and their raw replies are saved in `incoming/<TASK-ID>*.md`. Your job: apply them, make everything compile and work together, and polish the app end to end so it looks hand-crafted and consistent. Read `AGENTS.md`, `DESIGN.md`, `PLAN.md`, and `specs/README.md` first.

## 0. Setup

```
npm install
npx playwright install chromium
cp .env.example .env        # leave VITE_API_MODE=mock for now
npm run typecheck && npm run lint && npm run test && npm run build
```
The foundation passes all four before any task output is applied. Keep it that way after every batch.

## 1. Apply replies in batches

`node scripts/apply-incoming.mjs --dry` shows what each reply would write and rejects any file outside that task's ownership (see `specs/manifest.json`). Then apply by group, verifying after each:

1. DATA-01 → DATA-03 → DATA-02 → DATA-04 (then `npm run test`: the six story tests in `shared/stories.test.ts` must pass; tune DATA-02's hero overrides if they don't, never the engine rules)
2. UI-01 … UI-07, then UI-08
3. ART-01 … ART-05
4. SCR-04, SCR-06, SCR-09, SCR-11, SCR-12, SCR-13, SCR-15 (components first), then SCR-01 … SCR-17 (screens)
5. BE-01, BE-06, BE-08, BE-09, BE-07, BE-10, then adapters BE-02 … BE-05 and BE-11 if present

Use `--task <ID>` to apply one reply at a time when a batch breaks. After each batch: `npm run typecheck && npm run lint && npm run test && npm run build`.

Read `incoming/notes/<ID>.md` for every task: agents list assumptions, unfinished parts, and wiring you need to do.

## 2. Fixing rules

- **Contracts are frozen**: export names, props, and signatures in DESIGN.md section 12, `shared/types.ts`, and the stub headers. Fix seams inside the task-owned files first.
- If a contract truly must change, change it everywhere, re-run `node scripts/build-context.mjs && node scripts/build-bundles.mjs`, and note it in `BLOCKERS.md`.
- If a task's output is unusable, don't rewrite it from scratch silently: either fix it, or tell the human which task to re-dispatch (they'll regenerate `specs/bundles/<ID>.md` and send it to another agent). For small tasks, fixing is usually faster.
- Remove every `STUB (SPEC-00)` / `PLACEHOLDER` header once the real implementation is in. At the end, `grep -rn "STUB (SPEC-00)\|PLACEHOLDER\|not implemented" src shared server scrapers` should only show intentionally optional pieces (adapters marked blocked, etc.).
- Delete `src/pages/Placeholder.tsx` once no page uses it.

## 3. Known seams to check

- `Sheet` portals into `#app-column` (AppColumn) and works inside AppShell, RevealPage, and ScanPage.
- `RevealPage` (SCR-07) hosts `RevealResult` (SCR-08) in a scrolling panel; replay doesn't duplicate confetti; reduced motion path works.
- `PriceEntryPage` (SCR-05) uses `PriceKeypad` (SCR-06); query prefill from the scan flow works (`/check/:itemId?store=…&price=…`).
- `ScanPage` (SCR-14) with `useCamera`/`captureFrame` (SCR-13) and `ScanConfirmSheet`/`SampleSheet` (SCR-15); samples work end to end in mock mode.
- `ItemArt` (ART-05) renders both art sets (ART-03, ART-04) and falls back cleanly.
- `LandingPage` (SCR-02) hosts `HeroDemo` (SCR-01).
- `NearbyPrices` and `PriceHistoryChart` work on both the reveal (compact) and item detail.
- Live mode: `VITE_API_MODE=live npm run start`, then repeat the end-to-end paths below. Without keys: scan samples work, voice hidden, Tiger off.
- Scrapers: `npm run scrape -- --retailer saveon --item butter-salted-454g --dry` runs cleanly even for blocked or stub adapters; `npm run merge:data` produces a valid store.

## 4. Visual QA (loop until clean)

Write `scripts/shoot.ts` (Playwright; `npx tsx scripts/shoot.ts`) capturing each route and key state at **390×844** and **1440×900** into `screenshots/`:
`/`, `/` after the hero demo, `/check`, `/check` with search results and with no results, `/check/butter-salted-454g` steps 1–3, the reveal for each of the six featured deals (wait 4s), a reveal with `reducedMotion: "reduce"`, `/item/butter-salted-454g`, `/item/greek-yogurt-plain`, `/scan` (no-camera path) and the sample flow's confirm sheet, `/tricks` with each panel open, the 404, `/dev/ui`, `/dev/penny`.

Look at every screenshot and fix:
- **Consistency**: button heights, radii, lip depths, padding (`px-5`), type scale; Fredoka/Nunito everywhere, never a fallback font.
- **Hierarchy**: one obvious primary action per screen; nothing competes with the reveal.
- **Colour meaning**: verdict colours only mean verdicts, store tile colours only mean stores; normal-tier text is ink.
- **DESIGN section 11**: hunt down gradients, blurred shadows, emoji, uppercase eyebrows, arrows in labels, middle-dot strings, card grids, generic copy.
- **Motion**: reveal timing tight; all motion respects reduced motion; nothing animates without a reason.
- **Copy**: matches the task sheets, sentence case, Canadian spelling, consistent action names ("Check price" means the same everywhere).
- **States**: every loading, empty, and error state looks designed.
- **Penny**: right mood everywhere, never clipped or stretched.

## 5. End-to-end paths (browser, then a phone over the Cloudflare tunnel)

1. Landing → hero demo → Check a price → search "butter" → Save-On → $5.99 → was $8.49 → reveal: Normal price, Forever sale, Inflated "was" price, compact chart with "You" line, nearby prices → See price history.
2. Check home → flour flyer card → Steal with confetti → Check another.
3. Scan → sample yogurt (and a real photo on a phone in live mode with a Gemini key) → confirm → Overpriced with Shrinkflation.
4. Tricks → Multi-buy trap → Check a real example → Normal with Multi-buy trap.
5. Item detail → Use my location (phone, HTTPS) → nearby list updates with real distances → tap a row opens directions.

## 6. Finish

- Lazy-load the reveal, item, scan, and tricks routes with `React.lazy` (edit `src/routes.tsx`) so confetti and d3 only load where used. Lighthouse mobile on `/check`: performance 90+, accessibility 95+.
- All four commands pass, `BLOCKERS.md` resolved or explained, screenshots reviewed through at least two loops.
- Reply with: what you changed per task, which tasks you'd re-dispatch and why, and remaining issues.
