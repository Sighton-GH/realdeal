import path from "node:path";
import { RETAILERS } from "../shared/retailers";
import { ITEMS } from "../shared/seed/items";
import { LOCATIONS } from "../shared/seed/locations";
import type { DataStatus, PricePoint, PriceStore, RetailerId } from "../shared/types";
import { ADAPTERS } from "./adapters";
import { closeBrowser } from "./browser";
import { SCRAPE_CONFIG } from "./config";
import { createContext } from "./http";
import { readJson, writeJson } from "./lib/io";
import { mondayOf } from "./lib/week";
import { matchProduct } from "./match";
import { parseMultiBuy, parseSize } from "./parse";
import { BlockedError } from "./types";

interface CliOptions {
  retailers: RetailerId[];
  itemIds: string[] | null;
  branches: "primary" | "all";
  cache: boolean;
  dry: boolean;
  headed: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    retailers: [],
    itemIds: null,
    branches: "primary",
    cache: false,
    dry: false,
    headed: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--retailer" && i + 1 < args.length) {
      const vals = args[++i].split(",").map((s) => s.trim()) as RetailerId[];
      options.retailers.push(...vals);
    } else if (arg === "--item" && i + 1 < args.length) {
      const vals = args[++i].split(",").map((s) => s.trim());
      if (!options.itemIds) options.itemIds = [];
      options.itemIds.push(...vals);
    } else if (arg === "--branches" && i + 1 < args.length) {
      const val = args[++i].trim();
      if (val === "all" || val === "primary") {
        options.branches = val;
      }
    } else if (arg === "--cache") {
      options.cache = true;
    } else if (arg === "--dry") {
      options.dry = true;
    } else if (arg === "--headed") {
      options.headed = true;
    }
  }

  // Default retailers: all enabled in SCRAPE_CONFIG
  if (options.retailers.length === 0) {
    options.retailers = (Object.keys(SCRAPE_CONFIG) as RetailerId[]).filter(
      (r) => SCRAPE_CONFIG[r]?.enabled,
    );
  }

  return options;
}

interface RetailerSummary {
  retailerId: RetailerId;
  status: "ok" | "partial" | "blocked" | "error";
  matchedItems: number;
  totalItems: number;
  branchesScraped: number;
  durationMs: number;
  message?: string;
}

interface UnmatchedDetail {
  retailerId: RetailerId;
  itemId: string;
  itemName: string;
  bestCandidateTitle?: string;
  reason?: string;
}

async function run(): Promise<void> {
  const options = parseCliArgs();
  const todayStr = new Date().toISOString().slice(0, 10);
  const mondayDateStr = mondayOf(new Date());

  console.log(`[RealDeal Scraper] Running scrape for date: ${todayStr} (Monday: ${mondayDateStr})`);
  console.log(`[RealDeal Scraper] Retailers: ${options.retailers.join(", ")} | Branches: ${options.branches} | Cache: ${options.cache} | Dry: ${options.dry}`);

  // Filter items
  const itemsToScrape = options.itemIds
    ? ITEMS.filter((i) => options.itemIds!.includes(i.id))
    : ITEMS;

  // Retrieve previous sizes from prices.json if present
  const pricesFile = path.resolve(process.cwd(), "data/prices.json");
  const existingPriceStore = await readJson<PriceStore>(pricesFile);
  const previousSizesMap = new Map<string, number[]>();

  if (existingPriceStore?.points) {
    for (const pt of existingPriceStore.points) {
      const list = previousSizesMap.get(pt.itemId) ?? [];
      if (!list.includes(pt.sizeQty)) {
        list.push(pt.sizeQty);
        previousSizesMap.set(pt.itemId, list);
      }
    }
  }

  const allScrapedPoints: PricePoint[] = [];
  const retailerSummaries: RetailerSummary[] = [];
  const unmatchedList: UnmatchedDetail[] = [];

  try {
    for (const retailerId of options.retailers) {
      const adapter = ADAPTERS[retailerId];
      if (!adapter) {
        console.warn(`[Scraper] No adapter found for retailer "${retailerId}", skipping.`);
        continue;
      }

      const startTime = Date.now();
      const rawCacheDir = path.resolve(process.cwd(), `data/raw/${retailerId}/${todayStr}`);

      const ctx = createContext({
        retailerId,
        delayMs: SCRAPE_CONFIG[retailerId]?.delayMs ?? 2500,
        cacheDir: rawCacheDir,
        useCache: options.cache,
        log: (msg) => console.log(`[${retailerId}] ${msg}`),
      });

      // Branch determination
      const retailerLocations = LOCATIONS.filter((l) => l.retailerId === retailerId);
      const primaryLoc = retailerLocations.find((l) => Boolean(l.scrapeStoreId));

      const branchConfigs: Array<{ storeId?: string; branchRef?: string }> = [
        { storeId: undefined, branchRef: primaryLoc?.scrapeStoreId },
      ];

      if (options.branches === "all") {
        const otherLocs = retailerLocations.filter(
          (l) => l.scrapeStoreId && l.id !== primaryLoc?.id,
        );
        for (const loc of otherLocs) {
          branchConfigs.push({ storeId: loc.id, branchRef: loc.scrapeStoreId });
        }
      }

      let matchedItemsCount = 0;
      let retailerBlocked = false;
      let errorMessage: string | undefined;

      try {
        for (const branch of branchConfigs) {
          if (retailerBlocked) break;

          for (const item of itemsToScrape) {
            if (retailerBlocked) break;

            try {
              const res = await adapter.search(item.searchQuery, ctx, branch.branchRef);
              if (res.status === "blocked") {
                retailerBlocked = true;
                errorMessage = res.message ?? "Blocked by store anti-bot";
                break;
              }

              const prevSizes = previousSizesMap.get(item.id) ?? [item.sizeQty];
              const match = matchProduct(item, res.products, prevSizes);

              if (match) {
                matchedItemsCount++;
                const product = match.product;

                // Price and regularPrice
                let price = product.price;
                let regularPrice = product.regularPrice ?? product.wasPrice ?? product.price;
                let wasPrice = product.wasPrice;
                const onSale = Boolean(product.onSale || (wasPrice && wasPrice > price));

                const multiBuy = product.multiBuyText
                  ? parseMultiBuy(product.multiBuyText) ?? undefined
                  : undefined;

                // Parse package size
                let sizeQty = item.sizeQty;
                if (product.sizeText) {
                  const parsed = parseSize(product.sizeText);
                  if (parsed) sizeQty = parsed.qty;
                }

                // Produce per-lb conversion
                const isPerKgProduce =
                  item.unit === "kg" &&
                  (item.sizeLabel === "per kg" ||
                    (item.category === "produce" && item.sizeQty === 1));

                const isPerLb = /\/(?:lb)\b|\bper\s*lb\b/i.test(
                  product.unitPriceText || product.sizeText || "",
                );

                if (isPerKgProduce && isPerLb) {
                  price = Math.round((price / 0.45359237) * 100) / 100;
                  regularPrice = Math.round((regularPrice / 0.45359237) * 100) / 100;
                  if (wasPrice != null) {
                    wasPrice = Math.round((wasPrice / 0.45359237) * 100) / 100;
                  }
                  sizeQty = 1;
                }

                const point: PricePoint = {
                  itemId: item.id,
                  retailerId,
                  date: mondayDateStr,
                  price,
                  regularPrice,
                  onSale,
                  wasPrice,
                  multiBuy,
                  sizeQty,
                  source: "scrape",
                  storeId: branch.storeId,
                };

                allScrapedPoints.push(point);
              } else {
                const bestCandidate = res.products[0];
                unmatchedList.push({
                  retailerId,
                  itemId: item.id,
                  itemName: item.name,
                  bestCandidateTitle: bestCandidate?.title,
                  reason: res.products.length === 0 ? "No search results returned" : "Candidates rejected by matcher",
                });
              }
            } catch (err) {
              if (err instanceof BlockedError) {
                console.error(`[Scraper] Retailer ${retailerId} blocked: ${err.message}`);
                retailerBlocked = true;
                errorMessage = err.message;
                break;
              } else {
                console.warn(`[Scraper] Search failed for ${retailerId} / ${item.id}:`, err);
              }
            }
          }
        }
      } finally {
        await ctx.close();
      }

      const durationMs = Date.now() - startTime;
      let status: "ok" | "partial" | "blocked" | "error" = "ok";
      if (retailerBlocked) {
        status = "blocked";
      } else if (matchedItemsCount === 0) {
        status = "error";
      } else if (matchedItemsCount < itemsToScrape.length) {
        status = "partial";
      }

      retailerSummaries.push({
        retailerId,
        status,
        matchedItems: matchedItemsCount,
        totalItems: itemsToScrape.length * branchConfigs.length,
        branchesScraped: branchConfigs.length,
        durationMs,
        message: errorMessage,
      });
    }

    // Persist scraped results unless --dry
    if (!options.dry && allScrapedPoints.length > 0) {
      const scrapedPath = path.resolve(process.cwd(), `data/scraped/${todayStr}.json`);
      const existingPoints = (await readJson<PricePoint[]>(scrapedPath)) ?? [];

      const pointKey = (p: PricePoint) => `${p.itemId}|${p.retailerId}|${p.date}|${p.storeId ?? "chain"}`;
      const pointMap = new Map<string, PricePoint>();
      for (const p of existingPoints) pointMap.set(pointKey(p), p);
      for (const p of allScrapedPoints) pointMap.set(pointKey(p), p);

      const mergedList = Array.from(pointMap.values());
      await writeJson(scrapedPath, mergedList);
      console.log(`[Scraper] Wrote ${mergedList.length} scraped points to ${scrapedPath}`);

      // Update data/status.json
      const statusPath = path.resolve(process.cwd(), "data/status.json");
      const existingStatus = await readJson<DataStatus>(statusPath);
      const sourcesSet = new Set<"seed" | "hammer" | "scrape">(existingStatus?.sources ?? ["seed"]);
      sourcesSet.add("scrape");

      const statusObj: DataStatus = {
        mode: "live",
        updatedAt: new Date().toISOString(),
        sources: Array.from(sourcesSet),
        retailers: RETAILERS.map((r) => {
          const summary = retailerSummaries.find((s) => s.retailerId === r.id);
          const prev = existingStatus?.retailers.find((x) => x.retailerId === r.id);
          if (summary) {
            return {
              retailerId: r.id,
              ok: summary.status === "ok" || summary.status === "partial",
              lastScrapedAt: new Date().toISOString(),
              itemsFound: summary.matchedItems,
              message: summary.message,
            };
          }
          return prev ?? { retailerId: r.id, ok: true, itemsFound: 0 };
        }),
      };

      await writeJson(statusPath, statusObj);
      console.log(`[Scraper] Updated status file at ${statusPath}`);
    } else if (options.dry) {
      console.log(`[Scraper] Dry run: skipped file writes (${allScrapedPoints.length} points generated)`);
    }

    // Print summary table
    console.log("\n==================== SCRAPE SUMMARY ====================");
    console.table(
      retailerSummaries.map((s) => ({
        Retailer: s.retailerId,
        Status: s.status,
        "Matched / Total": `${s.matchedItems} / ${s.totalItems}`,
        Branches: s.branchesScraped,
        "Duration (s)": (s.durationMs / 1000).toFixed(1),
        Notes: s.message ?? "",
      })),
    );

    if (unmatchedList.length > 0) {
      console.log(`\nUnmatched Items (${unmatchedList.length} total):`);
      for (const u of unmatchedList.slice(0, 10)) {
        console.log(
          ` - [${u.retailerId}] ${u.itemName} (${u.itemId}): ${u.reason}${u.bestCandidateTitle ? ` (best candidate: "${u.bestCandidateTitle}")` : ""}`,
        );
      }
      if (unmatchedList.length > 10) {
        console.log(`   ...and ${unmatchedList.length - 10} more unmatched.`);
      }
    }
    console.log("========================================================\n");
  } finally {
    await closeBrowser();
  }
}

run().catch((err) => {
  console.error("[Scraper] Fatal error during scrape runner execution:", err);
  process.exit(1);
});