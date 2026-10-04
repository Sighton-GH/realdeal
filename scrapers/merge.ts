import fs from "node:fs";
import path from "node:path";
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
      overlays.push(hammerPoints);
      hasHammer = true;
      console.log(`[Data Merge] Added ${hammerPoints.length} points from Project Hammer (${HAMMER_PATH})`);
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
  const mergedStore: PriceStore = mergeStores(baseStore, overlays);
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