# DATA-03: Verdict engine + tests

| | |
|---|---|
| Suggested agent | Claude / GLM |
| Paste with | `specs/context/CORE.md`, `specs/context/BACKEND.md` (or use the ready-made bundle `specs/bundles/DATA-03.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **DATA-03**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, BACKEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/verdict.ts`
- `shared/engine/**` (any files inside this folder)
- `shared/verdict.test.ts`

## Goal
The verdict engine: pure TypeScript shared by the browser (mock mode) and the server (live mode). Correct numbers matter more than anything else in the app.

## Contract (keep every export from the current `shared/verdict.ts`)
```ts
export { DATA_END, WEEKS } from "./seed/constants";
export { generateSeedStore } from "./seed/generate";
export function unitPriceOf(price: number, sizeQty: number, multiBuy?: MultiBuy): number;
export function tierFor(pct: number): VerdictTier;
export function distanceKm(a: GeoPoint, b: GeoPoint): number;
export function mergeStores(base: PriceStore, overlays: PricePoint[][]): PriceStore;
export function getItemDetail(store: PriceStore, itemId: string): ItemDetail;
export function checkPrice(store: PriceStore, input: PriceCheckInput, now?: Date): Verdict;
export function searchItems(store: PriceStore, q: string, category?: Category): Item[];
export function getNearbyPrices(store: PriceStore, itemId: string, near: GeoPoint, limit?: number): NearbyStorePrice[];
```
- You may split internals into `shared/engine/*.ts` and re-export from `verdict.ts`.
- No DOM or Node APIs. For ids use `globalThis.crypto?.randomUUID?.()` with a `Math.random` fallback (first 8 chars).
- No imports from `src/`. Write a local `money(n)` → "$5.99" helper for trick text.
- Write tests against a small hand-built fixture store in `shared/engine/fixtures.ts` (not the seed generator, which another agent is writing).

## Rules (exact)

- **Chain-level only**: every calculation below (averages, sale frequency, tricks, best) uses only points with no `storeId`. Branch points are used only by `getNearbyPrices`.
- **Effective price** = `multiBuy ? multiBuy.total / multiBuy.qty : price`.
- **Unit price** = effective price / sizeQty. Round only for display, never in calculations.
- **Window**: per retailer, the latest 13 weekly points (≈90 days). `avgUnit90` = mean of the unit prices of all those points across all 4 retailers (≈52 values). `low90` / `high90` = min / max of the same set.
- **pctVsAvg** = (inputUnit − avg) / avg, where inputUnit uses `input.sizeQty ?? latest sizeQty at that retailer ?? item.sizeQty`.
- **Tier**: `pct <= -0.25` steal; `pct <= -0.10` good; `pct <= 0.10` normal; else high.
- **savingsVsAvg** = (avg − inputUnit) × inputSize.
- **saleFreq12w** = count of `onSale` in the latest 12 points at the input retailer / 12.
- **best** = the retailer with the lowest current unit price (latest point per retailer; include the input store at the input price).
- **dataPoints** = total points used for this item.
- **Tricks**, evaluated against the input retailer's history:
  - `perpetual_sale`: `saleFreq12w >= 0.5` AND (`input.wasPrice` is set OR that store's latest point is `onSale`). Title "Forever sale". Detail: "{Store} has had this on sale {n} of the last 12 weeks. The sale price is really the regular price." Stat: "{n} of 12 weeks".
  - `inflated_was_price`: `input.wasPrice` set AND the number of the latest 26 points with `price >= wasPrice * 0.98` divided by 26 is `< 0.25`. Title "Inflated 'was' price". Detail: "The tag claims {claimedPct}% off, but it only sold for {was} in {k} of the last 26 weeks. Against the real average you're saving {realPctText}." (`realPctText` = "nothing" if pct ≥ 0, else "{x}%"). Stat: "{k} of 26 weeks".
  - `multibuy_trap`: `input.multiBuy` set AND per-unit multi-buy price `>= usualSingle * 0.95`, where `usualSingle` = median `price` of points at that store in the latest 12 weeks that have no `multiBuy`. If per-unit is higher than usualSingle, detail: "Buying {qty} actually costs {diff} more each than buying one." Else: "Buying {qty} saves you just {diff} each compared with its usual single price." Title "Multi-buy trap". Stat: "{diff} each".
  - `shrinkflation`: `oldSize` = max `sizeQty` at that store in the latest 26 weeks; `newSize` = the size used for inputUnit. Flag if `newSize <= oldSize * 0.95` AND inputUnit ≥ (median unit price of that store's points at `oldSize`) × 1.03. Title "Shrinkflation". Detail: "This shrank from {old} to {new}, and the price per {unit} went up {x}%." Stat: "{shrinkPct}% smaller".
  - Use `formatMoney`-style output in strings without importing from `src/` (write a tiny local `money()` helper in shared).
- **Nearby prices** (`getNearbyPrices`): for every location in `store.locations`, compute `distanceKm` from `near`, sort ascending, take `limit`. For each, price = the latest branch point for that `storeId` if one exists in the latest week (`priceScope: "store"`), else the retailer's latest chain point (`priceScope: "chain"`). `tier` = `tierFor((unit - avgUnit90) / avgUnit90)`. `live` = point source is "scrape".
- **mergeStores**: items and locations come from `base`; the merge key is `itemId + retailerId + date + (storeId ?? "chain")`; later overlays win and keep their `source`.
- **getItemDetail**: `history` = chain points for the item, oldest first. `byRetailer` in `RETAILERS` order with `live` = latest point's source is "scrape". Throw `Error("Item not found")` for unknown ids.
- **searchItems**: case-insensitive substring match on name, brand, aliases; empty query returns all (optionally filtered by category); sorted by name.

## Tests (`shared/verdict.test.ts`, using `shared/engine/fixtures.ts`)
Build a fixture store with 3 items × 4 stores × 26 weeks where you control every number, then test:
- `tierFor` boundaries: −0.30 steal, −0.25 steal, −0.2499 good, −0.10 good, −0.0999 normal, 0.10 normal, 0.1001 high.
- `unitPriceOf(5, 0.9, { qty: 2, total: 5 })` = 2.5 / 0.9.
- avg/low/high over the latest 13 points per store; branch points are ignored by `getItemDetail` and `checkPrice`.
- Each trick fires on a constructed positive case and does not fire on a near-miss case (e.g. sale 5 of 12 weeks → no perpetual flag; multi-buy saving 6% → no trap; size −4% → no shrinkflation).
- `best` picks the cheapest current unit price, including the input itself.
- `mergeStores` overlay replaces a point with the same key and keeps branch points separate from chain points.
- `distanceKm` SFU Burnaby (49.2781, −122.9199) → downtown Vancouver (49.2827, −123.1207) ≈ 14.6 km.
- `getNearbyPrices` sorts by distance, respects `limit`, uses a branch point when present (`priceScope: "store"`) and falls back to chain (`"chain"`).

## Acceptance
- [ ] All tests pass with `npx vitest run shared`.
- [ ] Trick strings read naturally with real numbers ("on sale 10 of the last 12 weeks").

---

# CONTEXT: CORE (paste with every task)

## How to return your work (all tasks)

You are one of many AI agents each building one small piece of RealDeal in parallel. You cannot see the repo or the other agents' work. These context packs plus your task sheet are everything you need.

1. Return **only** the files listed in your task under "Files you return". Return each file **complete** (never "...", "rest unchanged", or diffs), in exactly this format:

   ### FILE: path/from/repo/root.tsx
   ```tsx
   // full file contents
   ```

   If a file itself contains triple backticks (for example a Markdown notes file), wrap it in **four** backticks instead.

2. Import only from files shown in these context packs, packages listed under Stack, or files you are returning. Do not invent shared helpers, components, tokens, or dependencies. If you truly need something that doesn't exist, build it privately inside one of your own files and mention it in NOTES.
3. Keep every export name, prop, and signature listed in your task's "Contract" exactly. Other agents are coding against them right now.
4. TypeScript strict: no `any`, no `@ts-ignore`, no unused variables, no leftover `console.log`.
5. End your reply with:

   ### NOTES
   - assumptions you made
   - anything you couldn't finish or verify
   - anything the integrator must wire up or check

An integrator (Claude Code) will drop your files into the repo, run typecheck/lint/tests/build, and fix any seams. Make their job easy: follow the contracts, keep files self-contained, and be honest in NOTES.

## The product

RealDeal is a mobile-first web app that tells shoppers whether the grocery price in front of them is actually a good price. You enter or scan a price (phone camera at a shelf tag), and Penny, a copper-coin mascot, reveals a verdict game-show style. It also flags pricing tricks, shows a price history chart, and compares prices at nearby store branches.

| Verdict | Unit price vs the 90-day average across all 4 stores |
|---|---|
| Steal | 25% or more below |
| Good deal | 10% to 25% below |
| Normal price | within ±10% |
| Overpriced | more than 10% above |

| Trick | Flagged when |
|---|---|
| Forever sale | on sale in 6+ of the last 12 weeks at that store |
| Inflated "was" price | the struck-out price was charged in fewer than 25% of the last 26 weeks |
| Multi-buy trap | "2 for $X" saves less than 5% per unit vs that store's usual single price |
| Shrinkflation | the package shrank 5%+ while the unit price rose 3%+ |

Scope: 40 staple groceries, 4 BC chains (Save-On-Foods, No Frills, Walmart, T&T), 26 weeks of weekly prices, 12 nearby branches. Data layers: deterministic seed data (always present) < Project Hammer historical import < live scraping. Mock mode runs the engine in the browser; live mode runs the same engine on a Hono server.

Six guaranteed test stories (the seed data and engine must produce these):

| Item | Store | Tag | Verdict | Tricks |
|---|---|---|---|---|
| Salted butter 454 g | Save-On-Foods | $5.99, was $8.49 | Normal price | Forever sale, Inflated "was" price |
| All-purpose flour 10 kg | No Frills | $12.99 | Steal | none |
| Plain Greek yogurt (now 500 g) | Walmart | $5.97 | Overpriced | Shrinkflation |
| Spaghetti 900 g | T&T | 2 for $5.00 | Normal price | Multi-buy trap |
| Strawberries 454 g | Save-On-Foods | $6.99 | Overpriced | none |
| Large eggs, dozen | Walmart | $3.97 | Good deal | none |

## Stack (already installed; do not add dependencies)

- React 19.3.0, react-router 8.4.0 (declarative: `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`, `useLocation`, all imported from `"react-router"`), TypeScript 6.0.3 strict, Vite 8.3.2.
- Tailwind CSS 4.3.3 (v4: tokens in `src/styles/theme.css` under `@theme`; **no tailwind.config.js, no v3 syntax**).
- motion 14.0.0: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`.
- @phosphor-icons/react 2.1.10 (icons only from here; weight "bold" default, "fill" for active/selected).
- zustand 5.0.15, @tanstack/react-query 5.104.1, clsx + tailwind-merge (via `cn()`), d3-scale 4.0.2, d3-shape 3.2.0, canvas-confetti 1.9.4.
- Server/scripts: hono 4.13.12, @hono/node-server 2.1.3, @google/genai 2.27.0, pg 8.23.1, cheerio 1.2.0, playwright 1.63.0, tsx, vitest 5.0.3. Node 22.

## Imports

- Frontend (`src/`): `@/…` = `src/…`, `@shared/…` = `shared/…`.
- `shared/`, `server/`, `scrapers/`, `scripts/`: **relative imports only** (they also run under tsx without aliases). `shared/` never imports from `src/`.

## Folder map

```
shared/types.ts        frozen domain types          shared/retailers.ts   RETAILERS, retailerById
shared/verdict.ts      engine                       shared/seed/          items, locations, generator, featured
shared/content/        trick copy                   src/api/              client.ts (api), mock.ts, live.ts
src/components/ui/     generic components           src/components/layout AppShell, AppColumn, TopBar, BottomNav
src/components/penny/  Penny, PennyFace, Logo        src/components/art/   ItemArt + item drawings
src/components/domain/ app-specific components      src/pages/<area>/     screens
src/lib/               brand, cn, format, motion, sfx, tier, useUserLocation
src/store/             zustand store                server/  scrapers/  scripts/
```

## Routes

| Path | Screen | Shell |
|---|---|---|
| `/` | Landing | full width, no shell |
| `/check` | Check home | AppShell |
| `/check/:itemId` | Price entry | AppShell, no bottom nav |
| `/reveal/:checkId` | Verdict reveal | own AppColumn, no nav |
| `/item/:itemId` | Item detail | AppShell |
| `/scan` | Camera scan | AppShell, no bottom nav |
| `/tricks` | Trick Files | AppShell |
| `/dev/ui`, `/dev/penny` | Dev playgrounds (dev only) | AppShell |

## Shared types and constants

#### `shared/types.ts`
```ts
// shared/types.ts: FROZEN contract. Change only via BLOCKERS.md and update every consumer.
export type RetailerId = "saveon" | "nofrills" | "walmart" | "tnt";
export type TileColour = "tangerine" | "pink" | "teal" | "violet";
export interface Retailer { id: RetailerId; name: string; shortName: string; tile: TileColour; website: string; }

export type Category = "produce" | "dairy" | "bakery" | "pantry";
export type Unit = "kg" | "L" | "each" | "dozen";
export type ArtKey =
  | "milk" | "eggs" | "butter" | "cheese" | "yogurt" | "sourcream" | "flour" | "bread" | "bagel"
  | "sugar" | "oats" | "pasta" | "rice" | "oil" | "jar" | "can" | "carton" | "banana" | "apple"
  | "carrot" | "potato" | "onion" | "tomato" | "lettuce" | "berries" | "broccoli" | "cucumber"
  | "avocado" | "generic";

export interface Item {
  id: string;            // kebab-case, e.g. "butter-salted-454g"
  name: string;          // "Salted butter"
  brand?: string;
  category: Category;
  sizeQty: number;       // current package size in `unit`s: 0.454 (kg), 4 (L), 6 (each), 1 (dozen or per-kg produce)
  unit: Unit;
  sizeLabel: string;     // "454 g", "4 L", "6 pack", "dozen", "per kg"
  artKey: ArtKey;
  aliases: string[];     // extra search words: ["butter", "salted butter"]
  searchQuery: string;   // what scrapers type into a store's search box
}

export interface MultiBuy { qty: number; total: number; }

export interface PricePoint {
  itemId: string;
  retailerId: RetailerId;
  date: string;          // YYYY-MM-DD, Monday of the week
  price: number;         // shelf price for one package (per kg for per-kg produce)
  regularPrice: number;  // non-sale price that week
  onSale: boolean;
  wasPrice?: number;     // struck-out price shown on the tag, if any
  multiBuy?: MultiBuy;
  sizeQty: number;       // package size that week (for shrinkflation)
  source: "seed" | "hammer" | "scrape";
  storeId?: string;      // set only for a branch-specific price; absent = chain-level price
}

export interface GeoPoint { lat: number; lng: number; }

export interface StoreLocation {
  id: string;            // "saveon-burnaby-1"
  retailerId: RetailerId;
  name: string;          // "Save-On-Foods Kingsway & Edmonds" (real branch name)
  address: string;
  lat: number;
  lng: number;
  scrapeStoreId?: string; // the chain's own store id, used by scrapers to request this branch's prices
}

export interface NearbyStorePrice {
  store: StoreLocation;
  distanceKm: number;
  price: number;         // shelf price for one package
  unitPrice: number;
  onSale: boolean;
  multiBuy?: MultiBuy;
  tier: VerdictTier;     // this price vs the item's 90-day average
  priceScope: "store" | "chain";  // "store" = price for this exact branch; "chain" = chain-wide price used as a stand-in
  live: boolean;         // came from a scrape
  date: string;          // week of the price
}

export interface PriceStore { items: Item[]; points: PricePoint[]; locations: StoreLocation[]; generatedAt: string; }

export interface RetailerStats {
  retailerId: RetailerId;
  currentPrice: number;
  currentUnitPrice: number;
  onSale: boolean;
  saleFreq12w: number;   // 0..1
  currentSizeQty: number;
  lastSeen: string;      // date of latest point
  live: boolean;         // latest point came from a scrape
}

export interface ItemStats { avgUnit90: number; lowUnit90: number; highUnit90: number; byRetailer: RetailerStats[]; }
export interface ItemDetail { item: Item; history: PricePoint[]; stats: ItemStats; }  // history: all retailers, oldest first

export interface PriceCheckInput {
  itemId: string;
  retailerId: RetailerId;
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  sizeQty?: number;      // only if different from the item's current size
  source: "manual" | "scan" | "flyer";
}

export type VerdictTier = "steal" | "good" | "normal" | "high";
export type TrickType = "perpetual_sale" | "inflated_was_price" | "multibuy_trap" | "shrinkflation";
export interface TrickFlag { type: TrickType; title: string; detail: string; stat: string; }

export interface Verdict {
  checkId: string;
  createdAt: string;     // ISO
  input: PriceCheckInput;
  item: Item;
  tier: VerdictTier;
  unitPrice: number;
  avgUnitPrice: number;
  pctVsAvg: number;      // -0.31 = 31% below average
  savingsVsAvg: number;  // dollars per package vs average; negative = paying more
  low90: number;         // unit
  high90: number;        // unit
  saleFreq12w: number;   // at the input store
  best: { retailerId: RetailerId; price: number; unitPrice: number };  // cheapest current price among all stores
  tricks: TrickFlag[];
  dataPoints: number;
}

export interface FeaturedDeal {
  id: string;
  item: Item;
  retailerId: RetailerId;
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  sizeQty?: number;
  tagline: string;       // "Flyer says: save $2.50!"
}

export interface ScanResult {
  status: "ok" | "no_price" | "error";
  candidates: Item[];    // best match first
  price?: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  retailerId?: RetailerId;
  sizeQty?: number;
  rawText?: string;
  message?: string;
}

export interface TrickInfo {
  type: TrickType;
  name: string;
  oneLiner: string;
  howItWorks: string;
  howWeCatch: string;
  exampleItemId: string;
  exampleRetailerId: RetailerId;
}

export interface DataStatus {
  mode: "mock" | "live";
  updatedAt: string;     // ISO
  sources: Array<"seed" | "hammer" | "scrape">;
  retailers: Array<{ retailerId: RetailerId; ok: boolean; lastScrapedAt?: string; itemsFound: number; message?: string }>;
}

export interface Api {
  searchItems(q: string, category?: Category): Promise<Item[]>;
  getItem(id: string): Promise<ItemDetail>;
  getFeatured(): Promise<FeaturedDeal[]>;
  checkPrice(input: PriceCheckInput): Promise<Verdict>;
  scanImage(image: Blob | null, sampleId?: string): Promise<ScanResult>;
  listTricks(): Promise<TrickInfo[]>;
  getDataStatus(): Promise<DataStatus>;
  getNearbyPrices(itemId: string, near: GeoPoint, limit?: number): Promise<NearbyStorePrice[]>;  // nearest first
}
```

#### `shared/retailers.ts`
```ts
import type { Retailer, RetailerId } from "./types";
export const RETAILERS: Retailer[] = [
  { id: "saveon",   name: "Save-On-Foods", shortName: "Save-On",   tile: "tangerine", website: "https://www.saveonfoods.com" },
  { id: "nofrills", name: "No Frills",     shortName: "No Frills", tile: "pink",      website: "https://www.nofrills.ca" },
  { id: "walmart",  name: "Walmart",       shortName: "Walmart",   tile: "teal",      website: "https://www.walmart.ca" },
  { id: "tnt",      name: "T&T Supermarket", shortName: "T&T",     tile: "violet",    website: "https://www.tntsupermarket.com" },
];
export const retailerById = (id: RetailerId): Retailer => RETAILERS.find(r => r.id === id)!;
```

#### `shared/seed/constants.ts`
```ts
// FROZEN
export const DATA_END = "2026-09-28"; // Monday of the latest seeded week
export const WEEKS = 26;
```

---

# CONTEXT: BACKEND (paste with every DATA and BE task)

Environment variables (`.env`, loaded by the server with `process.loadEnvFile?.()`):
```
VITE_API_MODE=mock          # mock | live
VITE_VOICE=off              # on | off
PORT=8787
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash   # use the newest Flash model listed in Google AI Studio
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
DATABASE_URL=               # optional, Tiger Data / Postgres
ADMIN_TOKEN=change-me       # protects POST /api/scrape
```

npm scripts: `dev`: `vite`; `build`: `tsc --noEmit -p tsconfig.app.json && vite build`; `preview`: `vite preview`; `typecheck`: `tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json`; `lint`: `eslint .`; `test`: `vitest run`; `server`: `tsx server/index.ts`; `start`: `vite build && tsx server/index.ts`; `scrape`: `tsx scrapers/run.ts`; `import:hammer`: `tsx scrapers/import-hammer.ts`; `merge:data`: `tsx scrapers/merge.ts`.

Data files (gitignored, under `data/`): `prices.json` (merged PriceStore served live), `scraped/<date>.json` (PricePoint[]), `raw/` (cache), `hammer/` (Project Hammer CSVs), `hammer-points.json`, `status.json` (DataStatus), `tts-cache/`.

## Frozen files (complete)

#### `scrapers/types.ts`
```ts
// FROZEN contract between BE-01 (core), BE-02..05 (adapters), BE-06 (runner) and BE-08 (scan).
import type { GeoPoint, RetailerId } from "../shared/types";

export interface RawProduct {
  title: string;
  brand?: string;
  sizeText?: string;
  price: number;
  regularPrice?: number;
  wasPrice?: number;
  multiBuyText?: string;
  onSale?: boolean;
  unitPriceText?: string;
  url?: string;
  storeRef?: string;
}

export interface AdapterResult {
  status: "ok" | "partial" | "blocked" | "error";
  message?: string;
  products: RawProduct[];
}

export interface BranchInfo { name: string; address: string; lat: number; lng: number; scrapeStoreId: string }

export interface AdapterContext {
  /** polite HTTP: delay, timeout, retry, cache, block detection (BE-01) */
  fetchText: (url: string, init?: RequestInit) => Promise<{ status: number; text: string; fromCache: boolean }>;
  fetchJson: <T = unknown>(url: string, init?: RequestInit) => Promise<{ status: number; data: T; fromCache: boolean }>;
  /** shared Playwright page factory (BE-01); call only if plain fetch can't work */
  newPage: () => Promise<import("playwright").Page>;
  log: (msg: string) => void;
}

export interface RetailerAdapter {
  retailerId: RetailerId;
  /** search the store's site for one item; branchRef = the chain's own store id for branch pricing, if supported */
  search(query: string, ctx: AdapterContext, branchRef?: string): Promise<AdapterResult>;
  /** optional: list branches near a point, used once to fill scrapeStoreId values */
  findBranches?(near: GeoPoint, ctx: AdapterContext): Promise<BranchInfo[]>;
}

export class BlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedError";
  }
}
```

#### `scrapers/adapters/index.ts`
```ts
// FROZEN
import type { RetailerId } from "../../shared/types";
import type { RetailerAdapter } from "../types";
import { adapter as saveon } from "./saveon";
import { adapter as nofrills } from "./nofrills";
import { adapter as walmart } from "./walmart";
import { adapter as tnt } from "./tnt";

export const ADAPTERS: Record<RetailerId, RetailerAdapter> = { saveon, nofrills, walmart, tnt };
```

## Current exports (placeholders other tasks replace; signatures are the contract)

#### `shared/verdict.ts` (exports only)
```ts
// PLACEHOLDER engine (SPEC-00). DATA-03 replaces the bodies; keep every export name and signature.
export { DATA_END, WEEKS } from "./seed/constants";
export { generateSeedStore } from "./seed/generate";
export function unitPriceOf(price: number, sizeQty: number, multiBuy?: MultiBuy): number;
export function tierFor(pct: number): VerdictTier;
export function distanceKm(a: GeoPoint, b: GeoPoint): number;
export function mergeStores(base: PriceStore, overlays: PricePoint[][]): PriceStore;
export function getItemDetail(store: PriceStore, itemId: string): ItemDetail;
export function checkPrice(store: PriceStore, input: PriceCheckInput, now: Date = new Date()): Verdict;
export function searchItems(store: PriceStore, q: string, category?: Category): Item[];
export function getNearbyPrices(store: PriceStore, itemId: string, near: GeoPoint, limit = 8): NearbyStorePrice[];
```

#### `shared/seed/types.ts` (exports only)
```ts
// FROZEN contract between DATA-01 (items/locations) and DATA-02 (generator).
export type SaleProfile = "rare" | "normal" | "perpetual";
export interface SeedItem {
  item: Item;
  /** target cross-store average package price in CAD (per kg for per-kg produce) */
  basePrice: number;
  /** produce with a seasonal price curve and higher noise */
  seasonal?: boolean;
  /** override the default "normal" sale behaviour per store */
  saleProfile?: Partial<Record<RetailerId, SaleProfile>>;
}
```

#### `shared/seed/items.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). DATA-01 replaces with all 40 items; keep the exports.
export const SEED_ITEMS: SeedItem[] = …;
export const ITEMS: Item[] = SEED_ITEMS.map((s) => s.item);
```

#### `shared/seed/locations.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). DATA-01 replaces with 12 real branches; keep the export.
export const LOCATIONS: StoreLocation[] = …;
```

#### `shared/seed/generate.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). DATA-02 replaces with the deterministic generator; keep `generateSeedStore(): PriceStore`.
export function mondays(end: string, count: number): string[];
export function generateSeedStore(): PriceStore;
```

#### `shared/seed/featured.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). DATA-04 replaces with the six featured deals; keep the export.
export function getFeaturedDeals(store: PriceStore): FeaturedDeal[];
```

#### `shared/content/tricks.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). SCR-16 replaces with the final copy; keep the export.
export const TRICKS: TrickInfo[] = …;
```

#### `src/api/mock.ts` (exports only)
```ts
// PLACEHOLDER (SPEC-00). DATA-04 replaces; keep `export const mockApi: Api`.
export const mockApi: Api = …;
```

#### `src/api/live.ts` (exports only)
```ts
// PLACEHOLDER from SPEC-00. BE-07 replaces it; keep `export const liveApi: Api`.
export const liveApi: Api = …;
```

#### `scrapers/parse.ts` (exports only)
```ts
// STUB (SPEC-00). BE-01 replaces; keep signatures.
/** "454 g" -> { qty: 0.454, unit: "kg" }; "4 L"; "500 mL"; "12 pack" -> each; "dozen"; "per kg"; "/lb" -> kg */
export function parseSize(text: string): { qty: number; unit: Unit } | null;
/** "2 for $5", "2/$5.00", "Buy 2 for $5" -> { qty: 2, total: 5 } */
export function parseMultiBuy(text: string): MultiBuy | null;
/** "$5.99" -> { price: 5.99 }; "$1.29/lb" -> { price: 1.29, per: "lb" } */
export function parsePrice(text: string): { price: number; per?: "kg" | "lb" | "100g" | "each" } | null;
```

#### `scrapers/match.ts` (exports only)
```ts
// STUB (SPEC-00). BE-01 replaces; keep signatures.
export interface MatchResult { item: Item; product: RawProduct; score: number; reason: string }
/** Best matching product for an item, or null. `previousSizes` lets shrunk packages still match. */
export function matchProduct(item: Item, products: RawProduct[], previousSizes: number[] = []): MatchResult | null;
/** Rank our items against free text (used by the Gemini scan). Best first. */
export function rankItems(items: Item[], text: string, sizeText?: string, limit = 3): Item[];
```

#### `server/scan.ts` (exports only)
```ts
// STUB (SPEC-00). BE-08 replaces; keep the signature. Used by server routes (BE-07).
export interface ScanImageInput { data: Buffer; mimeType: string }
export async function scanWithGemini(image: ScanImageInput | null, sampleId: string | undefined, store: PriceStore): Promise<ScanResult>;
```

#### `server/tiger.ts` (exports only)
```ts
// STUB (SPEC-00). BE-09 replaces; keep the signatures. Used by server routes (BE-07). Everything must no-op without DATABASE_URL.
export const tigerEnabled = (): boolean => Boolean(process.env.DATABASE_URL);
/** Create schema if needed and upsert all points. Resolves (never throws) even on DB errors. */
export async function syncToTiger(store: PriceStore): Promise<void>;
/** 90-day unit-price stats from the continuous aggregate, or null if unavailable. */
export async function getTigerStats(itemId: string): Promise<{ avgUnit90: number; lowUnit90: number; highUnit90: number } | null>;
```

#### `server/routes/speak.ts` (exports only)
```ts
// STUB (SPEC-00). BE-10 replaces; keep `export const speakRoute: Hono`. Mounted at /api/speak by BE-07.
export const speakRoute = new Hono();
```
