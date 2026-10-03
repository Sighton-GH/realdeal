# Task board

45 independent tasks. Every Wave 1 task can start right now, in any order, all at once: the foundation already contains working stubs with final props for everything, so no task waits on another.

## How to dispatch a task (chat agents: Gemini, GLM, Claude.ai, ChatGPT…)

1. Open `specs/bundles/<TASK-ID>.md`. It contains the task sheet plus the context packs it needs.
2. Copy the whole file and paste it into a fresh chat with the agent. (Frontend bundles are about 16–19k tokens; backend ones about 6–8k.)
3. Save the agent's full reply, unedited, as `incoming/<TASK-ID>.md` in the repo (for example `incoming/UI-01.md`). If you rerun a task with another agent, save it as `incoming/UI-01-b.md` and delete the old one.
4. Hand `incoming/` to Claude Code with `INTEGRATE.md`.

Repo agents (Claude Code, Gemini CLI, Codex) can instead be pointed at `specs/tasks/<TASK-ID>.md`; they write files in place and read the context from the code.

## If you change a contract

Edit the code, then regenerate the packs and bundles so new dispatches see it:
`node scripts/build-context.mjs && node scripts/build-bundles.mjs`

## Tasks

| ID | Task | Suggested agent | Start |
|---|---|---|---|
| UI-01 | Buttons: Button, LinkButton, IconButton | Gemini / Claude | now |
| UI-02 | Surfaces: Card, Chip, VerdictBadge, Section | any | now |
| UI-03 | Display: ProgressBar, PriceText, Skeleton | any | now |
| UI-04 | Inputs: TextField, SearchField, Stepper, Toggle | any | now |
| UI-05 | Overlays: Sheet, Toast | Gemini / Claude | now |
| UI-06 | Expressive: SpeechBubble, StoreTile, EmptyState | Gemini / Claude | now |
| UI-07 | App shell: AppShell, AppColumn, TopBar, BottomNav, pattern | Gemini / Claude | now |
| UI-08 | UI playground page (/dev/ui) | any (GLM fine) | now |
| ART-01 | Penny mascot (9 animated moods) + PennyFace | Claude (strongest at SVG) | now |
| ART-02 | Logo wordmark + favicon | any | now |
| ART-03 | Item illustrations: dairy and bakery (11) | Claude / Gemini | now |
| ART-04 | Item illustrations: pantry and produce (18) | Claude / Gemini | now |
| ART-05 | ItemArt wiring + Penny playground (/dev/penny) | any | now |
| DATA-01 | Catalogue: 40 items + 12 store branches | any with web access (for real branches) | now |
| DATA-02 | Seed price generator + hero stories | GLM / Claude | now |
| DATA-03 | Verdict engine + tests | Claude / GLM | now |
| DATA-04 | Featured deals, mock API, story tests | any | now |
| SCR-01 | Landing hero demo + ShelfTag | Claude / Gemini | now |
| SCR-02 | Landing page sections | Gemini | now |
| SCR-03 | Check home screen | Gemini | now |
| SCR-04 | ItemRow, FlyerDealCard, DataFreshness | any | now |
| SCR-05 | Price entry flow (3 steps) | Gemini / Claude | now |
| SCR-06 | Price keypad | any | now |
| SCR-07 | Reveal sequence (the hero moment) | Claude | now |
| SCR-08 | Reveal result panel | Gemini / Claude | now |
| SCR-09 | PriceGauge + TrickCard | any | now |
| SCR-10 | Item detail screen | Gemini | now |
| SCR-11 | Price history chart (d3 + SVG) | Claude / Gemini | now |
| SCR-12 | NearbyPrices + SaleStreak | any | now |
| SCR-13 | Camera hook + frame capture | Claude / GLM | now |
| SCR-14 | Scan screen (viewfinder, reading, failures) | Gemini / Claude | now |
| SCR-15 | Scan confirm sheet + sample tag images | any | now |
| SCR-16 | Trick Files page + trick copy | GLM / Gemini | now |
| SCR-17 | 404 + error screen | any | now |
| BE-01 | Scraper toolkit: parse, match, polite HTTP, browser | Claude / GLM | now |
| BE-02 | Save-On-Foods adapter | repo agent with browser (Claude Code / Gemini CLI) | repo agent |
| BE-03 | No Frills adapter | repo agent with browser | repo agent |
| BE-04 | Walmart adapter | repo agent with browser | repo agent |
| BE-05 | T&T adapter | repo agent with browser | repo agent |
| BE-06 | Scrape runner, Hammer import, data merge | GLM / Claude | now |
| BE-07 | Live server (Hono) + live API client | GLM / Claude | now |
| BE-08 | Gemini price-tag reader | any | now |
| BE-09 | Tiger Data mirror (optional) | any | now |
| BE-10 | Penny's voice (ElevenLabs) + SpeakButton | any | now |
| BE-11 | Sound effects generator (ElevenLabs) | repo agent with API key | repo agent |

Groups: **UI** shared components and shell, **ART** mascot and illustrations, **DATA** catalogue, seed data, engine, mock API, **SCR** screens and screen-level components, **BE** scrapers, server, Gemini, Tiger Data, ElevenLabs.

Taste-critical tasks (send to your strongest model, or to two models and keep the better one): ART-01 Penny, SCR-07 reveal, SCR-01 landing hero, UI-01 buttons, UI-06 store tiles, SCR-11 chart.

Tasks that need a repo agent with a terminal and the live web or an API key: BE-02 to BE-05 (store adapters) and BE-11 (sound effects). Everything else works with chat-only models.
