# CONTEXT: BACKEND (paste with every DATA and BE task)

Environment variables (`.env`, loaded by the server with `process.loadEnvFile?.()`):
```
VITE_API_MODE=mock          # mock | live
VITE_VOICE=off              # on | off
PORT=8788
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

