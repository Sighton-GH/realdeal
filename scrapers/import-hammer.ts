import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { ITEMS } from "../shared/seed/items";
import type { PricePoint, RetailerId } from "../shared/types";
import { mondayOf } from "./lib/week";
import { matchWithOverrides, type HammerOverrides } from "./hammer-overrides";
import type { RawProduct } from "./types";

const HAMMER_DIR = path.resolve(process.cwd(), "data/hammer");
const OUTPUT_FILE = path.resolve(process.cwd(), "data/hammer-points.json");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function mapVendor(vendorStr: string): RetailerId | null {
  const s = vendorStr.toLowerCase();
  if (s.includes("save-on") || s.includes("saveon") || s.includes("save on")) return "saveon";
  if (s.includes("no frills") || s.includes("nofrills")) return "nofrills";
  if (s.includes("walmart")) return "walmart";
  if (s.includes("t&t") || s.includes("t & t") || s.includes("tnt") || s.includes("tandt")) return "tnt";
  if (s.includes("loblaws")) return "loblaws";
  if (s.includes("metro")) return "metro";
  if (s.includes("voila")) return "voila";
  if (s.includes("galleria")) return "galleria";
  return null;
}

interface ProductInfo {
  itemId: string;
  retailerId: RetailerId;
  /** per-kg produce that the vendor prices per pound: convert to per-kg like the live scraper does */
  perLb: boolean;
}

const KG_PER_LB = 0.45359237;
const PER_LB_PATTERN = /(?:per\s*lb|\/\s*lb|\blbs?\b)/i;

async function run(): Promise<void> {
  console.log("[Hammer Import] Checking for Project Hammer CSV files in data/hammer/...");

  if (!fs.existsSync(HAMMER_DIR)) {
    console.log(
      "No Hammer data found in data/hammer/. Download the product and price CSVs from https://jacobfilipp.com/hammer/ into data/hammer/.",
    );
    process.exit(0);
  }

  const files = fs.readdirSync(HAMMER_DIR);
  const productFile = files.find((f) => f.toLowerCase().endsWith(".csv") && f.toLowerCase().includes("product"));
  const priceFile = files.find(
    (f) =>
      f.toLowerCase().endsWith(".csv") &&
      (f.toLowerCase().includes("price") || f.toLowerCase().includes("raw") || f.toLowerCase().includes("observation")),
  );

  if (!productFile || !priceFile) {
    console.log(
      "No Hammer data found in data/hammer/. Download the product and price CSVs from https://jacobfilipp.com/hammer/ into data/hammer/.",
    );
    process.exit(0);
  }

  const productPath = path.join(HAMMER_DIR, productFile);
  const pricePath = path.join(HAMMER_DIR, priceFile);

  console.log(`[Hammer Import] Found product file: ${productFile}`);
  console.log(`[Hammer Import] Found price file: ${priceFile}`);

  const overrides = new Map<RetailerId, HammerOverrides>();
  for (const retailer of ["saveon", "nofrills", "walmart", "tnt", "loblaws", "metro", "voila", "galleria"] as RetailerId[]) {
    const file = path.resolve("data/overrides", `${retailer}.json`);
    if (fs.existsSync(file)) overrides.set(retailer, JSON.parse(fs.readFileSync(file, "utf8")) as HammerOverrides);
  }

  // Step 1: Parse products CSV
  const matchedProducts = new Map<string, ProductInfo>();

  const productStream = fs.createReadStream(productPath, { encoding: "utf-8" });
  const productRl = readline.createInterface({ input: productStream, crlfDelay: Infinity });

  let productHeaders: string[] | null = null;
  let idCol = -1;
  let vendorCol = -1;
  let nameCol = -1;
  let brandCol = -1;
  let sizeCol = -1;

  for await (const line of productRl) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);

    if (!productHeaders) {
      productHeaders = cols.map((c) => c.trim().toLowerCase());
      idCol = productHeaders.findIndex((h) => h === "id" || h === "product_id");
      vendorCol = productHeaders.findIndex((h) => h.includes("vendor") || h.includes("store") || h.includes("retailer"));
      nameCol = productHeaders.findIndex(
        (h) => h.includes("product_name") || h.includes("name") || h.includes("title") || h.includes("description"),
      );
      brandCol = productHeaders.findIndex((h) => h.includes("brand"));
      sizeCol = productHeaders.findIndex(
        (h) => h.includes("size") || h.includes("unit") || h.includes("package") || h.includes("weight"),
      );

      if (idCol === -1 || nameCol === -1) {
        console.error("[Hammer Import] Unable to locate required 'id' or 'name' columns in product CSV headers.");
        process.exit(1);
      }
      continue;
    }

    const prodId = cols[idCol]?.trim();
    const vendorRaw = vendorCol !== -1 ? cols[vendorCol]?.trim() : "";
    const retailerId = vendorRaw ? mapVendor(vendorRaw) : null;
    if (!prodId || !retailerId) continue;

    const name = nameCol !== -1 ? cols[nameCol]?.trim() : "";
    const brand = brandCol !== -1 ? cols[brandCol]?.trim() : undefined;
    const size = sizeCol !== -1 ? cols[sizeCol]?.trim() : undefined;

    const rawProduct: RawProduct = {
      title: name,
      brand,
      sizeText: size,
      price: 0,
    };

    // Strict size evidence before assigning a Hammer product to a catalogue package.
    const best = matchWithOverrides(ITEMS, rawProduct, prodId, overrides.get(retailerId));
    if (best) {
      const item = best.item;
      const isPerKgProduce = item.unit === "kg" && item.sizeLabel === "per kg";
      const perLb = isPerKgProduce && PER_LB_PATTERN.test(`${size ?? ""} ${name}`);
      matchedProducts.set(prodId, { itemId: item.id, retailerId, perLb });
    }
  }

  console.log(`[Hammer Import] Matched ${matchedProducts.size} Hammer products to RealDeal catalogue items.`);

  // Step 2: Stream prices CSV
  const priceStream = fs.createReadStream(pricePath, { encoding: "utf-8" });
  const priceRl = readline.createInterface({ input: priceStream, crlfDelay: Infinity });

  let priceHeaders: string[] | null = null;
  let pIdCol = -1;
  let dateCol = -1;
  let priceValCol = -1;
  let oldPriceCol = -1;

  interface Observation {
    date: string;
    weekMonday: string;
    price: number;
    wasPrice?: number;
    rawDate: string;
  }
  const weeklyMap = new Map<string, Observation>();
  let newestObsDate = "";

  for await (const line of priceRl) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);

    if (!priceHeaders) {
      priceHeaders = cols.map((c) => c.trim().toLowerCase());
      pIdCol = priceHeaders.findIndex((h) => h === "product_id" || h === "id");
      dateCol = priceHeaders.findIndex((h) => h.includes("date") || h.includes("time"));
      priceValCol = priceHeaders.findIndex(
        (h) => h === "current_price" || h === "price" || (h.includes("price") && !h.includes("old")),
      );
      oldPriceCol = priceHeaders.findIndex((h) => h.includes("old") || h.includes("was") || h.includes("regular"));
      continue;
    }

    const prodId = cols[pIdCol]?.trim();
    if (!prodId) continue;
    const productInfo = matchedProducts.get(prodId);
    if (!productInfo) continue;

    const rawDate = dateCol !== -1 ? cols[dateCol]?.trim() : "";
    if (!rawDate) continue;

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) continue;

    const rawDateStr = rawDate.slice(0, 10);
    const weekMonday = mondayOf(parsedDate);

    const toKg = (n: number) => (productInfo.perLb ? Math.round((n / KG_PER_LB) * 100) / 100 : n);
    const rawPrice = priceValCol !== -1 ? parseFloat(cols[priceValCol]?.replace("$", "").trim()) : NaN;
    if (isNaN(rawPrice) || rawPrice <= 0) continue;
    const price = toKg(rawPrice);

    const oldPriceRaw = oldPriceCol !== -1 ? parseFloat(cols[oldPriceCol]?.replace("$", "").trim()) : NaN;
    const wasPrice = !isNaN(oldPriceRaw) && oldPriceRaw > 0 ? toKg(oldPriceRaw) : undefined;

    if (!newestObsDate || rawDateStr > newestObsDate) {
      newestObsDate = rawDateStr;
    }

    const bucketKey = `${productInfo.itemId}|${productInfo.retailerId}|${weekMonday}`;
    const existing = weeklyMap.get(bucketKey);

    // Keep the latest observation in the same Monday week
    if (!existing || rawDateStr >= existing.rawDate) {
      weeklyMap.set(bucketKey, {
        date: rawDateStr,
        weekMonday,
        price,
        wasPrice,
        rawDate: rawDateStr,
      });
    }
  }

  // Step 3: Filter to latest 26 weeks
  const allWeeks = Array.from(new Set(Array.from(weeklyMap.values()).map((o) => o.weekMonday))).sort();
  const latest26Weeks = new Set(allWeeks.slice(-26));

  // Rank product continuity within the actual display window, not its lifetime history.
  for (const [key, obs] of weeklyMap) if (!latest26Weeks.has(obs.weekMonday)) weeklyMap.delete(key);

  // Several Hammer products can match one catalogue item at one store (brands, sizes).
  // Mixing them makes the weekly price jump around, so keep only the product with the
  // most weeks of history for each item x store pair.
  const weeksByProduct = new Map<string, number>();
  for (const [key] of weeklyMap) {
    const [itemId, retailerId, , prodId] = key.split("|");
    const k = `${itemId}|${retailerId}|${prodId}`;
    weeksByProduct.set(k, (weeksByProduct.get(k) ?? 0) + 1);
  }
  const bestProduct = new Map<string, string>();
  const bestCount = new Map<string, number>();
  for (const [k, n] of weeksByProduct) {
    const [itemId, retailerId, prodId] = k.split("|");
    const pair = `${itemId}|${retailerId}`;
    if (n > (bestCount.get(pair) ?? 0)) {
      bestCount.set(pair, n);
      bestProduct.set(pair, prodId);
    }
  }
  for (const [key] of Array.from(weeklyMap)) {
    const [itemId, retailerId, , prodId] = key.split("|");
    if (bestProduct.get(`${itemId}|${retailerId}`) !== prodId) weeklyMap.delete(key);
  }


  const points: PricePoint[] = [];
  const pairWeekCounts = new Map<string, number>();

  for (const [key, obs] of weeklyMap.entries()) {
    if (!latest26Weeks.has(obs.weekMonday)) continue;

    const [itemId, retailerId] = key.split("|") as [string, RetailerId];
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) continue;

    const pairKey = `${itemId}|${retailerId}`;
    pairWeekCounts.set(pairKey, (pairWeekCounts.get(pairKey) ?? 0) + 1);

    const regularPrice = obs.wasPrice ?? obs.price;
    const onSale = Boolean(obs.wasPrice && obs.wasPrice > obs.price);

    points.push({
      itemId,
      retailerId,
      date: obs.weekMonday,
      price: obs.price,
      regularPrice,
      onSale,
      wasPrice: obs.wasPrice,
      sizeQty: item.sizeQty,
      source: "hammer",
    });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(points)); // compact: large file
  console.log(`[Hammer Import] Wrote ${points.length} historical price points to ${OUTPUT_FILE}`);

  // Step 4: Coverage and recency reporting
  const pairsWith8Weeks = Array.from(pairWeekCounts.values()).filter((c) => c >= 8).length;
  console.log(
    `[Hammer Import] Coverage: ${pairsWith8Weeks} item×store pairs with ≥ 8 weeks of data (across ${latest26Weeks.size} weeks).`,
  );
  console.log(`[Hammer Import] Newest observation date: ${newestObsDate}`);

  if (newestObsDate) {
    const diffDays = Math.round((Date.now() - new Date(newestObsDate).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 60) {
      console.warn(`[Hammer Import] Warning: Newest observation is ${diffDays} days old (>60 days). Dataset looks stale.`);
    }
  }
}

run().catch((err) => {
  console.error("[Hammer Import] Error running import:", err);
  process.exit(1);
});
