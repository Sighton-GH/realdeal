import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
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
  const s = storeName.toLowerCase();
  if (s.includes("save-on") || s.includes("save on") || s.includes("saveon")) {
    return "saveon";
  }
  if (s.includes("no frills") || s.includes("nofrills")) {
    return "nofrills";
  }
  if (s.includes("walmart")) {
    return "walmart";
  }
  if (s.includes("t&t") || s.includes("t & t") || s.includes("tnt")) {
    return "tnt";
  }
  return undefined;
}

/**
 * Post-processes the raw extraction from Gemini into a catalogue-matched ScanResult.
 */
export function postProcess(raw: RawGeminiExtraction, store: PriceStore): ScanResult {
  const fullText = [raw.productName, raw.brand].filter(Boolean).join(" ");
  const candidates = fullText ? rankItems(store.items, fullText, raw.sizeText ?? undefined, 3) : [];

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

  const multiBuy = raw.multiBuyText ? parseMultiBuy(raw.multiBuyText) : undefined;
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
export async function scanWithGemini(
  image: ScanImageInput | null,
  sampleId: string | undefined,
  store: PriceStore,
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      candidates: [],
      message: "Scanning isn't set up on this server.",
    };
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const ai = new GoogleGenAI({ apiKey });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Gemini scan timed out after 25s")), 25_000);
    });

    const request = () => ai.models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            data: image.data.toString("base64"),
            mimeType: image.mimeType,
          },
        },
        {
          text: PROMPT,
        },
      ],
      config: {
        temperature: 0,
        // Reading printed text needs little deliberation; MINIMAL is rejected by this model, LOW is the lowest it accepts
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    // Google answers 503 "high demand" in short spikes: one quick retry covers most of them
    const callPromise = request().catch(async (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/\b503\b|UNAVAILABLE|high demand/i.test(msg)) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return request();
    });

    const response = await Promise.race([callPromise, timeoutPromise]).finally(() => clearTimeout(timer));
    const responseText = response.text;
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
    // Log a short line (never the key or the whole error payload)
    const errMsg = err instanceof Error ? err.message : String(err);
    const rateLimited = /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(errMsg);
    console.error(`[scanWithGemini] ${rateLimited ? "Rate limited by Gemini (free tier is about 5 requests a minute)" : "Failed to process image"}: ${errMsg.slice(0, 160)}`);
    return {
      status: "error",
      candidates: [],
      message: rateLimited
        ? "Penny is getting a lot of scans right now. Try again in a minute, or pick a sample tag."
        : "Couldn't read that photo right now.",
    };
  }
}
