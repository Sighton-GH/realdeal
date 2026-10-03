import { describe, expect, it } from "vitest";
import { generateSeedStore } from "../shared/seed/generate";
import { postProcess, scanWithGemini } from "./scan";

describe("postProcess", () => {
  const store = generateSeedStore();

  it("handles a clean butter sale tag", () => {
    const raw = {
      isPriceTag: true,
      productName: "Salted Butter",
      brand: "Dairyland",
      sizeText: "454 g",
      price: 5.99,
      wasPrice: 8.49,
      storeName: "Save-On-Foods",
      confidence: 0.95,
      rawText: "Dairyland Salted Butter 454g SALE $5.99 WAS $8.49",
    };

    const res = postProcess(raw, store);
    expect(res.status).toBe("ok");
    expect(res.candidates.length).toBeGreaterThan(0);
    expect(res.candidates[0].id).toBe("butter-salted-454g");
    expect(res.price).toBe(5.99);
    expect(res.wasPrice).toBe(8.49);
    expect(res.retailerId).toBe("saveon");
    expect(res.sizeQty).toBeUndefined(); // exactly matches 454g, so not set
  });

  it("handles a multi-buy pasta tag", () => {
    const raw = {
      isPriceTag: true,
      productName: "Spaghetti",
      sizeText: "900 g",
      multiBuyText: "2 for $5.00",
      storeName: "T&T Supermarket",
      confidence: 0.92,
      rawText: "Spaghetti 900g 2 for $5.00",
    };

    const res = postProcess(raw, store);
    expect(res.status).toBe("ok");
    expect(res.candidates[0].id).toBe("spaghetti-900g");
    expect(res.multiBuy).toEqual({ qty: 2, total: 5.0 });
    expect(res.price).toBe(2.5);
    expect(res.retailerId).toBe("tnt");
  });

  it("handles a non-price photo (isPriceTag: false)", () => {
    const raw = {
      isPriceTag: false,
      productName: "Salted Butter",
      confidence: 0.1,
      rawText: "Random grocery aisle photo",
    };

    const res = postProcess(raw, store);
    expect(res.status).toBe("no_price");
    expect(res.candidates.length).toBeGreaterThan(0);
    expect(res.candidates[0].id).toBe("butter-salted-454g");
  });

  it("handles a tag with an unknown product", () => {
    const raw = {
      isPriceTag: true,
      productName: "Unobtainium Widget Gizmo 123",
      price: 29.99,
      confidence: 0.8,
    };

    const res = postProcess(raw, store);
    expect(res.status).toBe("no_price");
    expect(res.candidates).toEqual([]);
    expect(res.message).toBe("Penny read the tag but couldn't match the product.");
  });

  it("handles a per-lb produce tag and converts price to per-kg", () => {
    const raw = {
      isPriceTag: true,
      productName: "Bananas",
      price: 0.77,
      unitPriceText: "$0.77/lb",
      sizeText: "per lb",
      storeName: "No Frills",
      confidence: 0.95,
      rawText: "Yellow Bananas $0.77/lb",
    };

    const res = postProcess(raw, store);
    expect(res.status).toBe("ok");
    expect(res.candidates[0].id).toBe("bananas-kg");
    expect(res.retailerId).toBe("nofrills");
    // $0.77 / 0.45359237 =~ $1.70/kg
    expect(res.price).toBeCloseTo(1.7, 1);
  });
});

describe("scanWithGemini samples and errors", () => {
  const store = generateSeedStore();

  it("resolves sample-butter without Gemini API call", async () => {
    const res = await scanWithGemini(null, "sample-butter", store);
    expect(res.status).toBe("ok");
    expect(res.candidates[0].id).toBe("butter-salted-454g");
    expect(res.price).toBe(5.99);
    expect(res.wasPrice).toBe(8.49);
    expect(res.retailerId).toBe("saveon");
  });

  it("resolves sample-yogurt without Gemini API call", async () => {
    const res = await scanWithGemini(null, "sample-yogurt", store);
    expect(res.status).toBe("ok");
    expect(res.candidates[0].id).toBe("greek-yogurt-plain");
    expect(res.price).toBe(5.97);
    expect(res.sizeQty).toBe(0.5);
    expect(res.retailerId).toBe("walmart");
  });

  it("resolves sample-pasta without Gemini API call", async () => {
    const res = await scanWithGemini(null, "sample-pasta", store);
    expect(res.status).toBe("ok");
    expect(res.candidates[0].id).toBe("spaghetti-900g");
    expect(res.multiBuy).toEqual({ qty: 2, total: 5.0 });
    expect(res.retailerId).toBe("tnt");
  });

  it("returns error when neither image nor sample is given", async () => {
    const res = await scanWithGemini(null, undefined, store);
    expect(res.status).toBe("error");
    expect(res.message).toBe("No photo received.");
  });

  it("returns error when GEMINI_API_KEY is not set", async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const dummyImage = { data: Buffer.from("fake-image"), mimeType: "image/jpeg" };
      const res = await scanWithGemini(dummyImage, undefined, store);
      expect(res.status).toBe("error");
      expect(res.message).toBe("Scanning isn't set up on this server.");
    } finally {
      if (origKey !== undefined) {
        process.env.GEMINI_API_KEY = origKey;
      }
    }
  });
});