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

