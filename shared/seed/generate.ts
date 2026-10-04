import type { PricePoint, PriceStore, RetailerId } from "../types";
import { RETAILERS } from "../retailers";
import { DATA_END, WEEKS } from "./constants";
import { SEED_ITEMS, ITEMS } from "./items";
import { LOCATIONS } from "./locations";
import type { SeedItem } from "./types";
import { hashString, mulberry32 } from "./rng";

export function mondays(end: string, count: number): string[] {
  const out: string[] = [];
  const d = new Date(end + "T00:00:00Z");
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i * 7);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

function roundToShelfPrice(price: number, retailerId: RetailerId): number {
  const endings =
    retailerId === "walmart"
      ? [0.29, 0.47, 0.49, 0.79, 0.97, 0.99]
      : [0.29, 0.49, 0.79, 0.99];

  const intPart = Math.floor(price);
  let bestCandidate = 0.29;
  let minDiff = Infinity;

  for (let d = Math.max(0, intPart - 1); d <= intPart + 1; d++) {
    for (const ending of endings) {
      const candidate = Math.round((d + ending) * 100) / 100;
      if (candidate <= 0) continue;
      const diff = Math.abs(candidate - price);
      if (diff < minDiff) {
        minDiff = diff;
        bestCandidate = candidate;
      }
    }
  }

  return bestCandidate;
}

/** Only the original four chains get generated seed prices; the other chains come from Project Hammer data only. */
const SEED_RETAILER_IDS: RetailerId[] = ["saveon", "nofrills", "walmart", "tnt"];
const BASE_MULT: Partial<Record<RetailerId, number>> = {
  nofrills: 0.92,
  walmart: 0.95,
  tnt: 1.03,
  saveon: 1.08,
};

function generateChainPoints(seedItem: SeedItem, dates: string[]): PricePoint[] {
  const points: PricePoint[] = [];
  const itemId = seedItem.item.id;

  // Hero override 1: butter-salted-454g
  if (itemId === "butter-salted-454g") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const saveonNotOnSale = w === 4 || w === 9 || w === 17 || w === 21;
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: saveonNotOnSale ? 8.49 : 5.99,
        regularPrice: 8.49,
        onSale: !saveonNotOnSale,
        wasPrice: saveonNotOnSale ? undefined : 8.49,
        sizeQty: 0.454,
        source: "seed",
      });

      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: 5.69,
        regularPrice: 5.69,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });

      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 5.77,
        regularPrice: 5.77,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });

      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 5.99,
        regularPrice: 5.99,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });
    }
    return points;
  }

  // Hero override 2: flour-ap-10kg
  if (itemId === "flour-ap-10kg") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const isLatest = w === 25;
      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: isLatest ? 12.99 : 16.99,
        regularPrice: 16.99,
        onSale: isLatest,
        wasPrice: isLatest ? 16.99 : undefined,
        sizeQty: 10,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 17.97,
        regularPrice: 17.97,
        onSale: false,
        sizeQty: 10,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 18.99,
        regularPrice: 18.99,
        onSale: false,
        sizeQty: 10,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: 20.49,
        regularPrice: 20.49,
        onSale: false,
        sizeQty: 10,
        source: "seed",
      });
    }
    return points;
  }

  // Hero override 3: greek-yogurt-plain
  if (itemId === "greek-yogurt-plain") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const isLast8 = w >= 18;
      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 5.97,
        regularPrice: 5.97,
        onSale: false,
        sizeQty: isLast8 ? 0.5 : 0.65,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: 6.29,
        regularPrice: 6.29,
        onSale: false,
        sizeQty: 0.65,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: 5.99,
        regularPrice: 5.99,
        onSale: false,
        sizeQty: 0.65,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 6.19,
        regularPrice: 6.19,
        onSale: false,
        sizeQty: 0.65,
        source: "seed",
      });
    }
    return points;
  }

  // Hero override 4: spaghetti-900g
  if (itemId === "spaghetti-900g") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const isLatest3 = w >= 23;
      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 2.59,
        regularPrice: 2.59,
        onSale: false,
        multiBuy: isLatest3 ? { qty: 2, total: 5.0 } : undefined,
        sizeQty: 0.9,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: 2.69,
        regularPrice: 2.69,
        onSale: false,
        sizeQty: 0.9,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 2.47,
        regularPrice: 2.47,
        onSale: false,
        sizeQty: 0.9,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: 2.49,
        regularPrice: 2.49,
        onSale: false,
        sizeQty: 0.9,
        source: "seed",
      });
    }
    return points;
  }

  // Hero override 5: strawberries-454g
  if (itemId === "strawberries-454g") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const isLatest = w === 25;
      const isRecent = w >= 13;
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: isLatest ? 6.99 : isRecent ? 5.69 : 5.49,
        regularPrice: isLatest ? 6.99 : isRecent ? 5.69 : 5.49,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 3.97,
        regularPrice: 3.97,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: 4.19,
        regularPrice: 4.19,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 4.49,
        regularPrice: 4.49,
        onSale: false,
        sizeQty: 0.454,
        source: "seed",
      });
    }
    return points;
  }

  // Hero override 6: eggs-large-12
  if (itemId === "eggs-large-12") {
    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      points.push({
        itemId,
        retailerId: "walmart",
        date,
        price: 3.97,
        regularPrice: 3.97,
        onSale: false,
        sizeQty: 1,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "nofrills",
        date,
        price: 4.29,
        regularPrice: 4.29,
        onSale: false,
        sizeQty: 1,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "tnt",
        date,
        price: 4.89,
        regularPrice: 4.89,
        onSale: false,
        sizeQty: 1,
        source: "seed",
      });
      points.push({
        itemId,
        retailerId: "saveon",
        date,
        price: 5.19,
        regularPrice: 5.19,
        onSale: false,
        sizeQty: 1,
        source: "seed",
      });
    }
    return points;
  }

  // Non-hero items
  for (const r of RETAILERS.filter((x) => SEED_RETAILER_IDS.includes(x.id))) {
    const rng = mulberry32(hashString(itemId + r.id));
    const jitter = rng() * 0.06 - 0.03;
    const storeMultiplier = (BASE_MULT[r.id] ?? 1) * (1 + jitter);

    for (let w = 0; w < 26; w++) {
      const date = dates[w];
      const noiseRange = seedItem.seasonal ? 0.05 : 0.02;
      const noise = rng() * (2 * noiseRange) - noiseRange;
      const seasonalFactor = seedItem.seasonal
        ? 1 - 0.15 + 0.3 * (w / 25)
        : 1;

      const rawRegular =
        seedItem.basePrice * storeMultiplier * seasonalFactor * (1 + noise);
      const regularPrice = roundToShelfPrice(rawRegular, r.id);

      const profile = seedItem.saleProfile?.[r.id] ?? "normal";
      const chance =
        profile === "perpetual" ? 0.8 : profile === "rare" ? 0.06 : 0.18;
      const saleRoll = rng();
      const discountRoll = rng();

      let onSale = false;
      let price = regularPrice;
      let wasPrice: number | undefined = undefined;

      if (saleRoll < chance) {
        onSale = true;
        const discount = 0.15 + discountRoll * 0.1;
        let salePrice = roundToShelfPrice(regularPrice * (1 - discount), r.id);
        if (salePrice >= regularPrice) {
          salePrice = roundToShelfPrice(regularPrice * 0.8, r.id);
        }
        price = salePrice;
        wasPrice = regularPrice;
      }

      points.push({
        itemId,
        retailerId: r.id,
        date,
        price,
        regularPrice,
        onSale,
        wasPrice,
        sizeQty: seedItem.item.sizeQty,
        source: "seed",
      });
    }
  }

  return points;
}

/**
 * Hero stories pin the story store's numbers exactly. The other stores' series get a small
 * deterministic wiggle (about +-7%, snapped to shelf endings) so their history charts are not flat lines.
 */
const HERO_FREE_TO_VARY: Record<string, (p: PricePoint) => boolean> = {
  "butter-salted-454g": (p) => p.retailerId !== "saveon",
  "flour-ap-10kg": (p) => p.retailerId !== "nofrills",
  "greek-yogurt-plain": (p) => p.retailerId !== "walmart",
  "spaghetti-900g": (p) => p.retailerId !== "tnt",
  "strawberries-454g": (p) => p.retailerId !== "saveon",
  "eggs-large-12": (p) => p.retailerId !== "walmart",
};

function wiggleHeroSeries(itemId: string, pts: PricePoint[]): PricePoint[] {
  const free = HERO_FREE_TO_VARY[itemId];
  if (!free) return pts;
  const rngs = new Map<RetailerId, () => number>();
  return pts.map((p) => {
    if (!free(p)) return p;
    let rng = rngs.get(p.retailerId);
    if (!rng) {
      rng = mulberry32(hashString(itemId + p.retailerId + "wiggle"));
      rngs.set(p.retailerId, rng);
    }
    const price = roundToShelfPrice(p.price * (1 + (rng() * 2 - 1) * 0.07), p.retailerId);
    return { ...p, price, regularPrice: price };
  });
}

export function generateSeedStore(): PriceStore {
  const dates = mondays(DATA_END, WEEKS);
  const latestDate = dates[dates.length - 1];
  const points: PricePoint[] = [];

  for (const seedItem of SEED_ITEMS) {
    const chainPts = wiggleHeroSeries(seedItem.item.id, generateChainPoints(seedItem, dates));
    points.push(...chainPts);

    // Branch points for latest week only
    for (const loc of LOCATIONS) {
      const latestChain = chainPts.find(
        (p) => !p.storeId && p.retailerId === loc.retailerId && p.date === latestDate,
      );
      if (!latestChain) continue;

      const branchRng = mulberry32(hashString(seedItem.item.id + loc.id));
      const branchFactor = 0.96 + branchRng() * 0.08;
      const branchPrice = roundToShelfPrice(
        latestChain.price * branchFactor,
        loc.retailerId,
      );
      let branchWasPrice: number | undefined = undefined;
      if (latestChain.wasPrice !== undefined) {
        branchWasPrice = roundToShelfPrice(
          latestChain.wasPrice * branchFactor,
          loc.retailerId,
        );
        if (branchWasPrice <= branchPrice) {
          branchWasPrice = roundToShelfPrice(branchPrice * 1.25, loc.retailerId);
        }
      }

      let branchRegularPrice = branchPrice;
      if (latestChain.onSale) {
        branchRegularPrice = branchWasPrice ?? branchPrice;
      } else if (latestChain.regularPrice !== undefined) {
        branchRegularPrice = roundToShelfPrice(
          latestChain.regularPrice * branchFactor,
          loc.retailerId,
        );
      }

      points.push({
        itemId: seedItem.item.id,
        retailerId: loc.retailerId,
        storeId: loc.id,
        date: latestDate,
        price: branchPrice,
        regularPrice: branchRegularPrice,
        onSale: latestChain.onSale,
        wasPrice: branchWasPrice,
        multiBuy: latestChain.multiBuy,
        sizeQty: latestChain.sizeQty,
        source: "seed",
      });
    }
  }

  return {
    items: ITEMS,
    points,
    locations: LOCATIONS,
    generatedAt: DATA_END + "T12:00:00.000Z",
  };
}