# RealDeal: build plan

RealDeal tells you whether the grocery price in front of you is actually a good price. You enter or scan a price, and Penny (a copper-coin mascot) reveals a verdict game-show style: **Steal**, **Good deal**, **Normal price**, or **Overpriced**. It also flags the framing tricks behind the tag.

Brand name, mascot name, and tagline live in `src/lib/brand.ts`, so renaming takes 30 seconds.

## Product rules

| Verdict | Unit price vs the 90-day average across all 4 stores |
|---|---|
| Steal | 25% or more below |
| Good deal | 10% to 25% below |
| Normal price | within ±10% |
| Overpriced | more than 10% above |

| Trick | Flagged when |
|---|---|
| Forever sale | on sale in 6+ of the last 12 weeks at that store, so the "sale" price is really the regular price |
| Inflated "was" price | the struck-out price was actually charged in fewer than 25% of the last 26 weeks |
| Multi-buy trap | "2 for $X" saves less than 5% per unit vs that store's usual single price |
| Shrinkflation | the package shrank 5%+ while the unit price rose 3%+ |

Unit price (per kg, L, each, or dozen) is used everywhere so package-size games can't skew anything.

Three ways in and three kinds of evidence:

- **Snap it**: point your phone camera at a shelf tag or flyer, take the photo, and Gemini reads the item, price, "was" price, multi-buy, and size. You confirm, then get the reveal. Typing it in is the fallback.
- **Price chart**: every verdict links to a 26-week price history chart per store, with sale weeks marked and the verdict zones shaded. A compact version appears on the reveal itself.
- **Nearby stores**: using your location (fallback: SFU Burnaby), RealDeal lists the closest branches of the 4 chains with their current price for that item, distance, and a verdict badge, so you can see if the store down the street beats the one you're in.

Scope: 40 staple groceries (produce, dairy, bakery/flour, pantry) at 4 BC stores (Save-On-Foods, No Frills, Walmart, T&T), 26 weeks of weekly prices.

## Data strategy (three layers, best available wins)

1. **Seed data** (DATA-01, DATA-02): deterministic, realistic generated history. Always present. The app is fully usable on this alone.
2. **Project Hammer import** (BE-06): real historical prices from jacobfilipp.com/hammer, mapped onto our 40 items.
3. **Live scraping** (BE-01 to BE-06): adapters that fetch current prices from each store's website and write this week's point.

For any item, store, and week, a scraped point beats a Hammer point, which beats a seed point. Verdict averages use chain-level prices. Nearby-store prices use a branch-specific price when a scraper fetched one for that branch, otherwise the chain price, and the UI says which. If a store blocks scraping, its adapter reports `blocked` and the app silently uses the next layer. The UI shows freshness ("Prices updated 2 hours ago") and marks live prices.

## Architecture

```
Browser (React app)
   |  api (src/api/client.ts)
   |-- mock mode: shared engine + seed data, in the browser   <- default, zero setup
   '-- live mode: fetch /api/*  ->  Hono server (port 8787)
                                     |- shared engine (same code as mock)
                                     |- data/prices.json (seed + Hammer + scraped, merged)
                                     |- Gemini (scan a price tag)
                                     |- ElevenLabs (Penny's voice, optional)
                                     '- Tiger Data / Postgres (optional mirror + stats)
scrapers/ (npm run scrape)  ->  data/scraped/*.json  ->  merged into data/prices.json
Cloudflare tunnel -> localhost:8787
```

The verdict engine lives in `shared/` and is the same code in mock and live mode, so the frontend never cares which one is running.

## Workflow

1. **Foundation (done).** The repo runs: tokens, fonts, types, API contract, mock data plumbing, routing, and working stubs with final props for every component and cross-task interface. `npm run dev` shows the whole app in placeholder form.
2. **Dispatch (you).** 45 tasks in `specs/tasks/`, each with a ready-to-paste bundle in `specs/bundles/`. All Wave 1 tasks are independent: send as many as you like in parallel to Gemini, GLM, Claude, or anything else. See `specs/README.md`.
3. **Collect.** Save each reply verbatim as `incoming/<TASK-ID>.md`.
4. **Integrate (Claude Code).** Follow `INTEGRATE.md`: `node scripts/apply-incoming.mjs` drops files in place (enforcing file ownership), then typecheck, test, fix seams, visual QA, and end-to-end checks.

If you fall behind, these are safe to skip: BE-11 (sound effects), BE-09 (Tiger Data), BE-10 (voice), UI-08 and ART-05's playground, and individual store adapters (the app falls back to seed and Hammer data).

## Guaranteed test stories

These are built into the seed data so you always have known-good paths to test. Each appears as a "flyer deal" card on the Check screen.

| Item | Store | Tag says | Verdict | Tricks |
|---|---|---|---|
| Salted butter 454 g | Save-On-Foods | SALE $5.99, was $8.49 | Normal price | Forever sale, Inflated "was" price |
| All-purpose flour 10 kg | No Frills | $12.99 | Steal | none |
| Plain Greek yogurt (now 500 g) | Walmart | $5.97 | Overpriced | Shrinkflation |
| Spaghetti 900 g | T&T | 2 for $5.00 | Normal price | Multi-buy trap |
| Strawberries 454 g | Save-On-Foods | $6.99 | Overpriced | none |
| Large eggs, dozen | Walmart | $3.97 | Good deal | none |

DATA-04's story tests assert these. When real Hammer or scraped data is merged in live mode, the featured cards still use these tags, but verdicts may differ because they're computed from real prices. That's expected.

## Routes

| Path | Screen | Shell |
|---|---|---|
| `/` | Landing | full width, no app shell |
| `/check` | Check home (search, scan, flyer deals, recent checks) | app shell |
| `/check/:itemId` | Price entry (store, price, extras) | app shell, no bottom nav |
| `/reveal/:checkId` | Verdict reveal | full-bleed in column, no nav |
| `/item/:itemId` | Item detail and price history | app shell |
| `/scan` | Camera scan of a price tag | full-screen camera inside the column, no bottom nav |
| `/tricks` | The Trick Files | app shell |
| `*` | Not found | app shell |
