// shared/types.ts: FROZEN contract. Change only via BLOCKERS.md and update every consumer.
export type RetailerId = "saveon" | "nofrills" | "walmart" | "tnt" | "loblaws";
export type TileColour = "tangerine" | "pink" | "teal" | "violet" | "berry" | "forest" | "indigo" | "slate";
export interface Retailer { id: RetailerId; name: string; shortName: string; tile: TileColour; website: string; }

export type Category = "produce" | "dairy" | "bakery" | "pantry" | "meat" | "seafood" | "frozen" | "snacks" | "drinks" | "household";
export type Unit = "kg" | "L" | "each" | "dozen";
/** A unit as printed on a shelf tag. Converted to the item's Unit with shared/units.ts. */
export type TagUnit = "g" | "kg" | "lb" | "oz" | "mL" | "L" | "each" | "dozen";
/** The amount a printed price is for: { qty: 1, unit: "lb" } for "$1.27 /lb", { qty: 454, unit: "g" } for a 454 g pack. */
export interface TagAmount { qty: number; unit: TagUnit }
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
  retailerId?: RetailerId;  // absent = "Other" store
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  sizeQty?: number;      // only if different from the item's current size
  tagAmount?: TagAmount;  // the amount the price is for, as the user confirmed it (display only; sizeQty carries the converted size)
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
  best: { retailerId?: RetailerId; price: number; unitPrice: number };  // cheapest current price among all stores
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
  tagAmount?: TagAmount;  // the amount the scanned price is for, as printed
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

export interface StoreSummary {
  retailerId: RetailerId;
  itemCount: number;       // catalogue items with any chain-level price at this store
  realItemCount: number;   // of those, items whose latest price is real data (not seed)
  weeksOfData: number;     // longest run of weekly prices for one item
  latestDate: string;      // most recent price date at this store (YYYY-MM-DD)
  sources: Array<"seed" | "hammer" | "scrape">;
}

export interface StoreItemRow {
  item: Item;
  price: number;
  regularPrice: number;
  onSale: boolean;
  unitPrice: number;
  date: string;
  source: "seed" | "hammer" | "scrape";
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
  getStores(): Promise<StoreSummary[]>;
  getStoreItems(retailerId: RetailerId): Promise<StoreItemRow[]>;
}
