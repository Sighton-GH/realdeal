import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { TRICKS } from "../../shared/content/tricks";
import { RETAILERS } from "../../shared/retailers";
import { getFeaturedDeals } from "../../shared/seed/featured";
import { getStoreItems, getStoreSummaries } from "../../shared/stores";
import type { Category, DataStatus, PriceCheckInput, RetailerId } from "../../shared/types";
import { checkPrice, getItemDetail, getNearbyPrices, searchItems } from "../../shared/verdict";
import { getStore } from "../data";
import { type ScanImageInput, scanWithGemini } from "../scan";
import { getTigerStats, tigerEnabled } from "../tiger";
import { speakRoute } from "./speak";

export const apiRoute = new Hono();

// Request logging middleware: method, path, status, ms
apiRoute.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
});

// Mount /speak
apiRoute.route("/speak", speakRoute);

// GET /items?q=&category=
apiRoute.get("/items", (c) => {
  const q = c.req.query("q") ?? "";
  const catParam = c.req.query("category");
  const category = (catParam && ["produce", "dairy", "bakery", "pantry", "meat", "seafood", "frozen", "snacks", "drinks", "household"].includes(catParam))
    ? (catParam as Category)
    : undefined;

  const store = getStore();
  const items = searchItems(store, q, category);
  return c.json(items);
});

// GET /items/:id
apiRoute.get("/items/:id", async (c) => {
  const id = c.req.param("id");
  const store = getStore();

  let detail;
  try {
    detail = getItemDetail(store, id);
  } catch {
    return c.json({ error: "Item not found" }, 404);
  }

  if (tigerEnabled()) {
    try {
      const tigerStats = await getTigerStats(id);
      if (tigerStats) {
        const diff = Math.abs(tigerStats.avgUnit90 - detail.stats.avgUnit90);
        if (diff > 0.01) {
          console.warn(
            `[TigerStats] Tiger average ($${tigerStats.avgUnit90}) diverges from engine ($${detail.stats.avgUnit90}) by >$0.01 for ${id}. Keeping engine numbers.`,
          );
        } else {
          detail.stats.avgUnit90 = tigerStats.avgUnit90;
          detail.stats.lowUnit90 = tigerStats.lowUnit90;
          detail.stats.highUnit90 = tigerStats.highUnit90;
        }
      }
    } catch (err) {
      console.warn(`[TigerStats] Failed to retrieve stats for ${id}:`, err);
    }
  }

  return c.json(detail);
});

// GET /items/:id/nearby?lat=&lng=&limit=
apiRoute.get("/items/:id/nearby", (c) => {
  const id = c.req.param("id");
  const latStr = c.req.query("lat");
  const lngStr = c.req.query("lng");
  const limitStr = c.req.query("limit");

  if (!latStr || !lngStr) {
    return c.json({ error: "Missing required query parameters 'lat' and 'lng'" }, 400);
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (isNaN(lat) || isNaN(lng)) {
    return c.json({ error: "Query parameters 'lat' and 'lng' must be valid numbers" }, 400);
  }

  let limit = 8;
  if (limitStr !== undefined) {
    const parsedLimit = parseInt(limitStr, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
      return c.json({ error: "Limit must be an integer between 1 and 20" }, 400);
    }
    limit = parsedLimit;
  }

  const store = getStore();
  try {
    const nearby = getNearbyPrices(store, id, { lat, lng }, limit);
    return c.json(nearby);
  } catch {
    return c.json({ error: "Item not found" }, 404);
  }
});

// GET /featured
apiRoute.get("/featured", (c) => {
  const store = getStore();
  const deals = getFeaturedDeals(store);
  return c.json(deals);
});

// POST /check
apiRoute.post("/check", async (c) => {
  let body: Partial<PriceCheckInput>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const store = getStore();

  // Validate itemId
  if (!body.itemId || typeof body.itemId !== "string" || !store.items.some((i) => i.id === body.itemId)) {
    return c.json({ error: `Unknown or missing itemId: ${String(body.itemId)}` }, 400);
  }

  // Validate retailerId (optional; absent = "Other" store)
  if (body.retailerId !== undefined && (typeof body.retailerId !== "string" || !RETAILERS.some((r) => r.id === body.retailerId))) {
    return c.json({ error: `Unknown or missing retailerId: ${String(body.retailerId)}` }, 400);
  }

  // Validate price
  if (typeof body.price !== "number" || isNaN(body.price) || body.price <= 0 || body.price > 1000) {
    return c.json({ error: "Price must be a number between 0 and 1000" }, 400);
  }

  // Optional wasPrice
  if (body.wasPrice !== undefined && (typeof body.wasPrice !== "number" || isNaN(body.wasPrice) || body.wasPrice <= 0)) {
    return c.json({ error: "wasPrice must be a positive number" }, 400);
  }

  // Optional multiBuy
  if (body.multiBuy !== undefined) {
    if (
      typeof body.multiBuy !== "object" ||
      body.multiBuy === null ||
      typeof body.multiBuy.qty !== "number" ||
      body.multiBuy.qty <= 0 ||
      typeof body.multiBuy.total !== "number" ||
      body.multiBuy.total <= 0
    ) {
      return c.json({ error: "multiBuy must contain positive numeric qty and total" }, 400);
    }
  }

  // Optional sizeQty
  if (body.sizeQty !== undefined && (typeof body.sizeQty !== "number" || isNaN(body.sizeQty) || body.sizeQty <= 0)) {
    return c.json({ error: "sizeQty must be a positive number" }, 400);
  }

  // Optional tagAmount
  if (body.tagAmount !== undefined) {
    const t = body.tagAmount as { qty?: unknown; unit?: unknown } | null;
    const knownUnits = ["g", "kg", "lb", "oz", "mL", "L", "each", "dozen"];
    if (
      typeof t !== "object" ||
      t === null ||
      typeof t.qty !== "number" ||
      !Number.isFinite(t.qty) ||
      t.qty <= 0 ||
      typeof t.unit !== "string" ||
      !knownUnits.includes(t.unit)
    ) {
      return c.json({ error: "tagAmount must have a positive qty and a known unit" }, 400);
    }
  }

  // Optional source
  if (body.source !== undefined && !["manual", "scan", "flyer"].includes(body.source)) {
    return c.json({ error: "source must be 'manual', 'scan', or 'flyer'" }, 400);
  }

  const input: PriceCheckInput = {
    itemId: body.itemId,
    retailerId: body.retailerId,
    price: body.price,
    wasPrice: body.wasPrice,
    multiBuy: body.multiBuy,
    sizeQty: body.sizeQty,
    tagAmount: body.tagAmount,
    source: body.source ?? "manual",
  };

  const verdict = checkPrice(store, input);
  return c.json(verdict);
});

// POST /scan
apiRoute.post("/scan", async (c) => {
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Expected multipart/form-data" }, 400);
  }

  const imageEntry = formData.get("image");
  const sampleIdEntry = formData.get("sampleId");
  const sampleId = typeof sampleIdEntry === "string" ? sampleIdEntry : undefined;

  let scanInput: ScanImageInput | null = null;

  if (imageEntry && typeof imageEntry === "object" && "arrayBuffer" in imageEntry) {
    const file = imageEntry as File;
    const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

    if (file.size > MAX_SIZE) {
      return c.json({ error: "Image file too large (max 8MB)" }, 413);
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return c.json({ error: "Unsupported media type: image file required" }, 415);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    scanInput = {
      data: buffer,
      mimeType: file.type,
    };
  }

  const store = getStore();
  const scanResult = await scanWithGemini(scanInput, sampleId, store);
  return c.json(scanResult);
});

// GET /stores
apiRoute.get("/stores", (c) => c.json(getStoreSummaries(getStore())));

// GET /stores/:id/items
apiRoute.get("/stores/:id/items", (c) => {
  const id = c.req.param("id");
  if (!RETAILERS.some((r) => r.id === id)) return c.json({ error: `Unknown retailerId: ${id}` }, 404);
  return c.json(getStoreItems(getStore(), id as RetailerId));
});

// GET /tricks
apiRoute.get("/tricks", (c) => {
  return c.json(TRICKS);
});

// GET /status
apiRoute.get("/status", (c) => {
  const statusPath = path.resolve(process.cwd(), "data/status.json");
  if (fs.existsSync(statusPath)) {
    try {
      const raw = fs.readFileSync(statusPath, "utf-8");
      return c.json(JSON.parse(raw));
    } catch {
      // Fall through to build from store
    }
  }

  const store = getStore();
  const sourcesSet = new Set(store.points.map((p) => p.source));
  const sources = Array.from(sourcesSet);

  const status: DataStatus = {
    mode: "live",
    updatedAt: store.generatedAt || new Date().toISOString(),
    sources: sources.length ? sources : ["seed"],
    retailers: RETAILERS.map((r) => {
      const retailerPoints = store.points.filter((p) => p.retailerId === r.id);
      const uniqueItems = new Set(retailerPoints.map((p) => p.itemId));
      const scrapePoints = retailerPoints.filter((p) => p.source === "scrape");
      const latestScrape = scrapePoints.length
        ? scrapePoints.map((p) => p.date).sort().slice(-1)[0]
        : undefined;

      return {
        retailerId: r.id,
        ok: true,
        lastScrapedAt: latestScrape,
        itemsFound: uniqueItems.size,
      };
    }),
  };

  return c.json(status);
});

// POST /scrape
let isScrapeRunning = false;

apiRoute.post("/scrape", (c) => {
  const adminToken = process.env.ADMIN_TOKEN;
  const clientToken = c.req.header("x-admin-token");

  // The .env.example placeholder counts as "not configured" so a copied .env can't leave this open
  if (!adminToken || adminToken === "change-me" || clientToken !== adminToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (isScrapeRunning) {
    return c.json({ error: "Scrape job already in progress" }, 409);
  }

  isScrapeRunning = true;
  console.log("[Scraper] Starting scrape job in background...");

  const child = spawn("npm run scrape && npm run merge:data", {
    shell: true,
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  child.on("exit", (code) => {
    isScrapeRunning = false;
    console.log(`[Scraper] Scrape job finished with exit code ${code}`);
  });

  return c.json({ message: "Scrape job started" }, 202);
});

// Error handling: unexpected errors -> 500 without stack trace
apiRoute.onError((err, c) => {
  console.error("[API Error]", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default apiRoute;