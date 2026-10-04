import fs from "node:fs";
import path from "node:path";
import { ITEMS } from "../shared/seed/items";
import { RETAILERS } from "../shared/retailers";
import type { DataStatus, PricePoint, PriceStore } from "../shared/types";
import { generateSeedStore, getItemDetail, mergeStores } from "../shared/verdict";
import { readJson, writeJson } from "./lib/io";

const PRICES_PATH = path.resolve(process.cwd(), "data/prices.json");
const STATUS_PATH = path.resolve(process.cwd(), "data/status.json");
const HAMMER_PATH = path.resolve(process.cwd(), "data/hammer-points.json");
const SCRAPED_DIR = path.resolve(process.cwd(), "data/scraped");

async function run(): Promise<void> {
  console.log("[Data Merge] Starting merge of seed, Hammer, and scraped price layers...");

  const baseStore = generateSeedStore();
  const overlays: PricePoint[][] = [];
  let hasHammer = false;
  let hasScrape = false;

  // 1. Check Project Hammer historical data
  if (fs.existsSync(HAMMER_PATH)) {
    const hammerPoints = await readJson<PricePoint[]>(HAMMER_PATH);
    if (hammerPoints && hammerPoints.length > 0) {
      // Guard against wrong-size or wrong-product matches: if an item x store pair's median Hammer
      // price is far from the seed median for that item, keep the seed data for that pair.
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
      const seedMedian = new Map<string, number>();
      for (const item of baseStore.items) {
        const ps = baseStore.points.filter((p) => p.itemId === item.id).map((p) => p.price);
        if (ps.length) seedMedian.set(item.id, median(ps));
      }
      // Some raw rows (seen on Walmart) carry cents as dollars, e.g. 596 for $5.96. Drop single
      // points more than 4x above or 4x below the seed median for that item.
      // Real-data-only items have no seed: use the cross-store Hammer median as the reference instead.
      const hammerByItem = new Map<string, number[]>();
      for (const p of hammerPoints) hammerByItem.set(p.itemId, [...(hammerByItem.get(p.itemId) ?? []), p.price]);
      for (const [id, ps] of hammerByItem) if (!seedMedian.has(id)) seedMedian.set(id, median(ps));
      let outliers = 0;
      const pairs = new Map<string, PricePoint[]>();
      for (const p of hammerPoints) {
        const r = seedMedian.get(p.itemId);
        if (r && (p.price / r > 4 || p.price / r < 0.25)) {
          outliers++;
          continue;
        }
        const k = `${p.itemId}|${p.retailerId}`;
        pairs.set(k, [...(pairs.get(k) ?? []), p]);
      }
      if (outliers) console.warn(`[Data Merge] Dropped ${outliers} outlier Hammer points (price >4x or <0.25x seed median).`);
      const kept: PricePoint[] = [];
      const dropped: string[] = [];
      for (const [k, pts] of pairs) {
        const ref = seedMedian.get(pts[0].itemId);
        const m = median(pts.map((p) => p.price));
        if (ref && (m / ref > 2 || m / ref < 0.5)) {
          dropped.push(`${k} (median ${m} vs seed ${ref})`);
        } else {
          kept.push(...pts);
        }
      }
      if (dropped.length) {
        console.warn(`[Data Merge] Dropped ${dropped.length} implausible Hammer pairs (kept seed for them):`);
        for (const d of dropped) console.warn(`  - ${d}`);
      }
      if (kept.length > 0) {
        overlays.push(kept);
        hasHammer = true;
      }
      console.log(`[Data Merge] Added ${kept.length} of ${hammerPoints.length} points from Project Hammer (${HAMMER_PATH})`);
    }
  }

  // 2. Check scraped runs in data/scraped/, sorted oldest first
  if (fs.existsSync(SCRAPED_DIR)) {
    const scrapedFiles = fs
      .readdirSync(SCRAPED_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort(); // Lexicographical sort YYYY-MM-DD.json orders oldest first

    for (const file of scrapedFiles) {
      const filePath = path.join(SCRAPED_DIR, file);
      const points = await readJson<PricePoint[]>(filePath);
      if (points && points.length > 0) {
        overlays.push(points);
        hasScrape = true;
        console.log(`[Data Merge] Added ${points.length} points from scrape layer: ${file}`);
      }
    }
  }

  // 3. Merge layers into a unified PriceStore
  const mergedStore: PriceStore = { ...mergeStores(baseStore, overlays), items: ITEMS };
  console.log(`[Data Merge] Merged store contains ${mergedStore.points.length} total price points.`);

  // 4. Sanity check: for every catalogue item, getItemDetail must not throw
  console.log("[Data Merge] Verifying sanity check (getItemDetail for all catalogue items)...");
  let sanityErrors = 0;
  for (const item of mergedStore.items) {
    try {
      getItemDetail(mergedStore, item.id);
    } catch (err) {
      sanityErrors++;
      console.error(`[Data Merge] Error computing item detail for "${item.id}":`, err);
    }
  }

  if (sanityErrors > 0) {
    console.error(`[Data Merge] Sanity check failed with ${sanityErrors} broken items. Aborting write.`);
    process.exit(1);
  }
  console.log(`[Data Merge] Sanity check passed for all ${mergedStore.items.length} catalogue items.`);

  // 5. Write data/prices.json
  fs.writeFileSync(PRICES_PATH, JSON.stringify(mergedStore)); // compact: the mock app bundles this file
  console.log(`[Data Merge] Wrote unified PriceStore to ${PRICES_PATH}`);

  // 6. Update data/status.json
  const existingStatus = await readJson<DataStatus>(STATUS_PATH);
  const sources: Array<"seed" | "hammer" | "scrape"> = ["seed"];
  if (hasHammer) sources.push("hammer");
  if (hasScrape) sources.push("scrape");

  const status: DataStatus = {
    mode: "live",
    updatedAt: new Date().toISOString(),
    sources,
    retailers: RETAILERS.map((r) => {
      const prev = existingStatus?.retailers.find((x) => x.retailerId === r.id);
      const itemsFound = new Set(
        mergedStore.points.filter((p) => p.retailerId === r.id).map((p) => p.itemId),
      ).size;

      return {
        retailerId: r.id,
        ok: prev?.ok ?? true,
        lastScrapedAt: prev?.lastScrapedAt,
        itemsFound,
        message: prev?.message,
      };
    }),
  };

  await writeJson(STATUS_PATH, status);
  console.log(`[Data Merge] Updated ${STATUS_PATH} (sources: [${sources.join(", ")}])`);
  console.log("[Data Merge] Merge completed successfully.");
}

run().catch((err) => {
  console.error("[Data Merge] Fatal error during data merge:", err);
  process.exit(1);
});