import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { classifyGeminiError, cooldownMsFor, getKeyPool, type KeyPool } from "./geminiKeys";
import { rankItems } from "../scrapers/match";
import { parseMultiBuy, parsePrice, parseSize } from "../scrapers/parse";
import type { PriceStore, RetailerId, ScanResult } from "../shared/types";

export interface ScanImageInput {
  data: Buffer;
  mimeType: string;
}

export interface RawGeminiExtraction {
  isPriceTag?: boolean | null;
  productName?: string | null;
  brand?: string | null;
  sizeText?: string | null;
  price?: number | null;
  wasPrice?: number | null;
  multiBuyText?: string | null;
  unitPriceText?: string | null;
  storeName?: string | null;
  confidence?: number | null;
  rawText?: string | null;
}

const PROMPT =
  "You are reading a grocery shelf tag or flyer photographed in a Canadian store. " +
  "Extract only what is printed. If several prices appear, price is what the shopper pays now for one unit; " +
  "a struck-out, 'was', or 'reg.' price goes in wasPrice; a multi-buy like '2 for $5' goes in multiBuyText. " +
  "A per-weight or per-volume line such as '$11.94 / KG', '$1.29/lb' or '$0.99/100g' is NEVER price or wasPrice: put it in unitPriceText. " +
  "Only set wasPrice when the tag clearly shows a struck-out, 'was' or 'reg.' price. " +
  "Use null for anything not visible. Do not guess.";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isPriceTag: {
      type: Type.BOOLEAN,
      description: "True if the image shows a grocery store shelf tag, price tag, or flyer deal.",
    },
    productName: {
      type: Type.STRING,
      description: "Name of the grocery item printed on the tag.",
    },
    brand: {
      type: Type.STRING,
      description: "Brand name printed on the tag, if visible.",
    },
    sizeText: {
      type: Type.STRING,
      description: "Package size printed on the tag (e.g. '454 g', '4 L', '12 pack', 'per lb').",
    },
    price: {
      type: Type.NUMBER,
      description: "Current price the shopper pays for one unit.",
    },
    wasPrice: {
      type: Type.NUMBER,
      description: "Struck-out, 'was', or 'reg.' price, if printed.",
    },
    multiBuyText: {
      type: Type.STRING,
      description: "Multi-buy deal text like '2 for $5', if printed.",
    },
    unitPriceText: {
      type: Type.STRING,
      description: "Unit price text like '$1.29/lb' or '$0.99/100g', if printed.",
    },
    storeName: {
      type: Type.STRING,
      description: "Store name or chain printed on the tag, if visible.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence from 0 to 1.",
    },
    rawText: {
      type: Type.STRING,
      description: "All text transcribed from the tag.",
    },
  },
};

/**
 * Handles preset sample tags for offline demoing.
 */
function handleSample(sampleId: string, store: PriceStore): ScanResult | null {
  if (sampleId === "sample-butter") {
    const butter = store.items.find((i) => i.id === "butter-salted-454g");
    const otherDairy = store.items
      .filter((i) => i.category === "dairy" && i.id !== "butter-salted-454g")
      .slice(0, 2);
    const candidates = butter ? [butter, ...otherDairy] : [];
    return {
      status: "ok",
      candidates,
      price: 5.99,
      wasPrice: 8.49,
      retailerId: "saveon",
    };
  }

  if (sampleId === "sample-yogurt") {
    const yogurt = store.items.find((i) => i.id === "greek-yogurt-plain");
    const otherDairy = store.items
      .filter((i) => i.category === "dairy" && i.id !== "greek-yogurt-plain")
      .slice(0, 2);
    const candidates = yogurt ? [yogurt, ...otherDairy] : [];
    return {
      status: "ok",
      candidates,
      price: 5.97,
      sizeQty: 0.5,
      retailerId: "walmart",
    };
  }

  if (sampleId === "sample-pasta") {
    const pasta = store.items.find((i) => i.id === "spaghetti-900g");
    const otherPantry = store.items
      .filter((i) => i.category === "pantry" && i.id !== "spaghetti-900g")
      .slice(0, 2);
    const candidates = pasta ? [pasta, ...otherPantry] : [];
    return {
      status: "ok",
      candidates,
      price: 2.5,
      multiBuy: { qty: 2, total: 5.0 },
      retailerId: "tnt",
    };
  }

  return null;
}

/**
 * Maps raw store name text to a known RetailerId.
 */
function mapRetailer(storeName?: string | null): RetailerId | undefined {
  if (!storeName) return undefined;
  const s = storeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (s.includes("save-on") || s.includes("save on") || s.includes("saveon")) {
    return "saveon";
  }
  if (s.includes("no frills") || s.includes("nofrills")) {
    return "nofrills";
  }
  if (s.includes("walmart")) {
    return "walmart";
  }
  if (s.includes("t&t") || s.includes("t & t") || s.includes("tnt") || s.includes("tandt") || s.includes("t and t")) {
    return "tnt";
  }
  if (/\bloblaws?\b/.test(s)) return "loblaws";
  return undefined;
}

/**
 * Post-processes the raw extraction from Gemini into a catalogue-matched ScanResult.
 */
export function postProcess(raw: RawGeminiExtraction, store: PriceStore): ScanResult {
  // Match on the product name only: our catalogue is brand-agnostic and the model's "brand" field is often
  // a barcode or a slogan ("EVERYDAY PRICE") that would pull the match to the wrong item.
  // If the name gives nothing, fall back to everything the model transcribed.
  const productName = (raw.productName ?? "").trim();
  let candidates = productName ? rankItems(store.items, productName, raw.sizeText ?? undefined, 3) : [];
  if (candidates.length === 0 && raw.rawText) candidates = rankItems(store.items, raw.rawText, raw.sizeText ?? undefined, 3);

  // If not a price tag or no product found
  if (raw.isPriceTag === false) {
    return {
      status: "no_price",
      candidates,
      rawText: raw.rawText ?? undefined,
      message: "No price found on tag.",
    };
  }

  if (candidates.length === 0) {
    return {
      status: "no_price",
      candidates: [],
      rawText: raw.rawText ?? undefined,
      message: "Penny read the tag but couldn't match the product.",
    };
  }

  // A multi-buy the model reports must also read the same in its transcript of the tag (it has invented "2 for $5" on tags without one)
  let multiBuy = raw.multiBuyText ? parseMultiBuy(raw.multiBuyText) : undefined;
  if (multiBuy && raw.rawText) {
    const fromTranscript = parseMultiBuy(raw.rawText);
    if (!fromTranscript || fromTranscript.qty !== multiBuy.qty || Math.abs(fromTranscript.total - multiBuy.total) > 0.005) multiBuy = undefined;
  }
  let price = raw.price != null ? raw.price : undefined;
  if (price === undefined && multiBuy) {
    price = multiBuy.total / multiBuy.qty;
  }

  if (price === undefined) {
    return {
      status: "no_price",
      candidates,
      rawText: raw.rawText ?? undefined,
      message: "No price found on tag.",
    };
  }

  const topItem = candidates[0];

  // Adjust for per-lb produce pricing (e.g. bananas $0.77/lb -> ~$1.70/kg)
  const isPerKgProduce =
    topItem.unit === "kg" &&
    (topItem.sizeLabel === "per kg" || (topItem.category === "produce" && topItem.sizeQty === 1));

  const priceInfo = parsePrice(raw.unitPriceText ?? "") || parsePrice(raw.sizeText ?? "");
  const hasPerLbIndicator =
    priceInfo?.per === "lb" ||
    /\/(?:lb)\b|\bper\s*lb\b/i.test(raw.unitPriceText ?? "") ||
    /\/(?:lb)\b|\bper\s*lb\b/i.test(raw.sizeText ?? "");

  if (isPerKgProduce && hasPerLbIndicator && price !== undefined) {
    price = Math.round((price / 0.45359237) * 100) / 100;
  }

  // Parse package sizeQty (only if differs from item size by > 2%)
  let sizeQty: number | undefined;
  if (raw.sizeText) {
    const parsedSize = parseSize(raw.sizeText);
    if (parsedSize && parsedSize.unit === topItem.unit) {
      const diffPct = Math.abs(parsedSize.qty - topItem.sizeQty) / topItem.sizeQty;
      if (diffPct > 0.02) {
        sizeQty = parsedSize.qty;
      }
    }
  }

  // A "was" price must be higher than the price, and is not the per-kg/per-lb line the model sometimes mistakes it for
  let wasPrice = raw.wasPrice != null ? raw.wasPrice : undefined;
  const unitLine = parsePrice(raw.unitPriceText ?? "")?.price;
  if (wasPrice !== undefined && (wasPrice <= price || (unitLine !== undefined && Math.abs(wasPrice - unitLine) < 0.005))) {
    wasPrice = undefined;
  }
  // The model sometimes invents a "was" price (seen: 1.29, 0). A real one is printed on the tag, so it must be in the transcript.
  if (wasPrice !== undefined && raw.rawText && !raw.rawText.replace(/[\s,]/g, "").includes(wasPrice.toFixed(2))) {
    wasPrice = undefined;
  }

  return {
    status: "ok",
    candidates,
    price,
    wasPrice,
    multiBuy: multiBuy ?? undefined,
    retailerId: mapRetailer(raw.storeName),
    sizeQty,
    rawText: raw.rawText ?? undefined,
  };
}

/**
 * Reads a shelf tag image with Gemini Flash and returns a ScanResult matched to the catalogue.
 */
/** One Gemini call with a specific key. Returns the model's JSON text. */
export async function generateWithKey(apiKey: string, modelName: string, image: ScanImageInput, signal?: AbortSignal): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      { inlineData: { data: image.data.toString("base64"), mimeType: image.mimeType } },
      { text: PROMPT },
    ],
    config: {
      abortSignal: signal,
      temperature: 0,
      // Reading printed text needs little deliberation; MINIMAL is rejected by this model, LOW is the lowest it accepts
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
  return response.text;
}

export interface ScanDeps {
  /** replace the network call (tests) */
  generate?: (apiKey: string, modelName: string, image: ScanImageInput, signal?: AbortSignal) => Promise<string | undefined>;
  /** replace the shared key pool (tests) */
  pool?: KeyPool;
  sleep?: (ms: number) => Promise<void>;
  /** how long one key gets to answer before the next key is tried (tests) */
  attemptTimeoutMs?: number;
  /** how long the whole scan may take across all keys (tests) */
  totalTimeoutMs?: number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// One slow key must not use up the whole scan: each key gets ATTEMPT_TIMEOUT_MS, then the next key is tried.
// The browser waits CLIENT_TIMEOUT_MS (src/api/live.ts), which must stay above TOTAL_TIMEOUT_MS.
const ATTEMPT_TIMEOUT_MS = 12_000;
const TOTAL_TIMEOUT_MS = 40_000;
const MIN_ATTEMPT_MS = 2_000;

class AttemptTimeout extends Error {
  constructor(ms: number) {
    super(`Gemini did not answer within ${Math.round(ms / 1000)}s`);
  }
}

/** Gemini was reached (or tried) but could not give an answer: every attempt timed out, or the model was overloaded. */
class ScanFailed extends Error {
  constructor(readonly kind: "timeout" | "unavailable") {
    super(kind === "timeout" ? "Gemini timed out" : "Gemini is overloaded");
  }
}

/** Runs `run` with an abort signal that fires after `ms`; rejects with AttemptTimeout and cancels the request. */
async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AttemptTimeout(ms));
    }, ms);
  });
  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

class AllKeysBusy extends Error {
  constructor(readonly waitMs: number | null) {
    super("All Gemini API keys are rate limited or unusable");
  }
}

/**
 * Runs the call on the next healthy key. A rate-limited key is benched (for Google's suggested wait) and the
 * request moves on to the next key at once; an invalid key is switched off; a key that does not answer in time,
 * or a 503, moves on to the next key too (a 503 after a short pause, at most twice).
 */
async function callWithRotation(
  pool: KeyPool,
  modelName: string,
  image: ScanImageInput,
  generate: NonNullable<ScanDeps["generate"]>,
  sleep: (ms: number) => Promise<void>,
  attemptMs: number,
  totalMs: number,
): Promise<string | undefined> {
  const deadline = Date.now() + totalMs;
  let retries503 = 0;
  let timeouts = 0;
  let lastFailure: ScanFailed["kind"] | null = null;
  // at most one pass over every key, plus the 503 retries
  for (let attempt = 0; attempt < pool.size + 2; attempt++) {
    const remaining = deadline - Date.now();
    if (lastFailure && remaining < Math.min(MIN_ATTEMPT_MS, attemptMs)) break; // no time left for another real try
    const slot = pool.acquire();
    if (!slot) break;
    try {
      return await withTimeout((signal) => generate(slot.key, modelName, image, signal), Math.min(attemptMs, Math.max(remaining, 1)));
    } catch (err) {
      if (err instanceof AttemptTimeout) {
        lastFailure = "timeout";
        if (++timeouts >= pool.size) break; // every key had its chance
        console.warn(`[Gemini] key ${slot.label} did not answer in ${Math.round(attemptMs / 1000)}s; trying the next key`);
        continue;
      }
      const kind = classifyGeminiError(err);
      if (kind === "rate_limit") {
        const ms = cooldownMsFor(err);
        pool.bench(slot, ms);
        console.warn(`[Gemini] key ${slot.label} rate limited, resting ${Math.round(ms / 1000)}s; trying the next key`);
        continue;
      }
      if (kind === "bad_key") {
        pool.disable(slot);
        console.warn(`[Gemini] key ${slot.label} was rejected (invalid, expired or not allowed); switched off for this run`);
        continue;
      }
      if (kind === "unavailable") {
        lastFailure = "unavailable";
        if (retries503 >= 2) break;
        retries503++;
        console.warn(`[Gemini] key ${slot.label} got a 503 (high demand); trying the next key`);
        await sleep(retries503 * 1200); // Google's "high demand" spikes are short: 1.2s, then 2.4s
        continue;
      }
      throw err;
    }
  }
  if (lastFailure) throw new ScanFailed(lastFailure);
  throw new AllKeysBusy(pool.waitMs());
}

/**
 * Reads a shelf tag image with Gemini Flash and returns a ScanResult matched to the catalogue.
 * Keys rotate automatically (see server/geminiKeys.ts); `deps` is only for tests.
 */
export async function scanWithGemini(
  image: ScanImageInput | null,
  sampleId: string | undefined,
  store: PriceStore,
  deps: ScanDeps = {},
): Promise<ScanResult> {
  // Check samples first (no API call needed)
  if (sampleId) {
    const sampleResult = handleSample(sampleId, store);
    if (sampleResult) {
      return sampleResult;
    }
  }

  if (!image) {
    return {
      status: "error",
      candidates: [],
      message: "No photo received.",
    };
  }

  const pool = deps.pool ?? getKeyPool();
  if (pool.size === 0) {
    return {
      status: "error",
      candidates: [],
      message: "Scanning isn't set up on this server.",
    };
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const generate = deps.generate ?? generateWithKey;
  const sleep = deps.sleep ?? defaultSleep;

  try {
    const responseText = await callWithRotation(
      pool, modelName, image, generate, sleep, deps.attemptTimeoutMs ?? ATTEMPT_TIMEOUT_MS, deps.totalTimeoutMs ?? TOTAL_TIMEOUT_MS,
    );
    if (!responseText) {
      return {
        status: "error",
        candidates: [],
        message: "Couldn't read that photo right now.",
      };
    }

    const raw = JSON.parse(responseText) as RawGeminiExtraction;
    return postProcess(raw, store);
  } catch (err) {
    if (err instanceof AllKeysBusy) {
      const seconds = err.waitMs === null ? null : Math.max(1, Math.ceil(err.waitMs / 1000));
      console.error(`[scanWithGemini] No usable Gemini key right now (${JSON.stringify(pool.status())})`);
      return {
        status: "error",
        candidates: [],
        message:
          seconds === null
            ? "Scanning isn't working on this server right now. Pick a sample tag or type the price."
            : `Penny is getting a lot of scans right now. Try again in ${seconds <= 90 ? `${seconds} seconds` : "a few minutes"}, or pick a sample tag.`,
      };
    }
    if (err instanceof ScanFailed) {
      console.error(`[scanWithGemini] Gemini ${err.kind === "timeout" ? "timed out on every key tried" : "is overloaded"} (${JSON.stringify(pool.status())})`);
      return {
        status: "error",
        candidates: [],
        message:
          err.kind === "timeout"
            ? "The scan timed out: Gemini took too long to answer. Try again in a moment, or pick a sample tag."
            : "Gemini is overloaded right now. Try again in a moment, or pick a sample tag.",
      };
    }
    // Log a short line (never a key or the whole error payload)
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[scanWithGemini] Failed to process image: ${errMsg.slice(0, 160)}`);
    return {
      status: "error",
      candidates: [],
      message: "Couldn't read that photo right now.",
    };
  }
}
