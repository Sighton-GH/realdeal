import { describe, expect, it } from "vitest";
import { generateSeedStore } from "../shared/seed/generate";
import { postProcess, scanWithGemini } from "./scan";
import { KeyPool } from "./geminiKeys";

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
describe("postProcess: guards against mis-read 'was' prices", () => {
  const store = generateSeedStore();
  it("drops a 'was' price that is really the per-kg unit price line", () => {
    const r = postProcess(
      { isPriceTag: true, productName: "Plain Greek Yogurt", sizeText: "500 g", price: 5.97, wasPrice: 11.94, unitPriceText: "$11.94 / KG" },
      store,
    );
    expect(r.status).toBe("ok");
    expect(r.price).toBe(5.97);
    expect(r.wasPrice).toBeUndefined();
  });
  it("drops a 'was' price that is not higher than the price", () => {
    const r = postProcess({ isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99, wasPrice: 5.99 }, store);
    expect(r.wasPrice).toBeUndefined();
  });
  it("keeps a genuine struck-out 'was' price", () => {
    const r = postProcess({ isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99, wasPrice: 8.49, unitPriceText: "$13.19 / KG" }, store);
    expect(r.wasPrice).toBe(8.49);
  });
});

describe("scanWithGemini key rotation", () => {
  const store = generateSeedStore();
  const image = { data: Buffer.from("fake"), mimeType: "image/png" };
  const K = (n: number) => `AQ.rotationkey${n}_abcdefghijklmnopqrstuv`;
  const tag = JSON.stringify({ isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99, wasPrice: 8.49 });
  const limited = () => new Error('{"error":{"code":429,"message":"Quota exceeded. Please retry in 30s.","status":"RESOURCE_EXHAUSTED"}}');
  const invalid = () => new Error('{"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}');
  const noSleep = async () => {};

  it("moves to the next key when one is rate limited, and rests the first", async () => {
    const used: string[] = [];
    const pool = new KeyPool([K(1), K(2), K(3)]);
    const r = await scanWithGemini(image, undefined, store, {
      pool, sleep: noSleep,
      generate: async (key) => { used.push(key); if (key === K(1)) throw limited(); return tag; },
    });
    expect(r.status).toBe("ok");
    expect(r.candidates[0].id).toBe("butter-salted-454g");
    expect(used).toEqual([K(1), K(2)]);
    expect(pool.status()[0].state).toBe("cooling");
    expect(pool.status()[1].state).toBe("ready");
  });

  it("keeps skipping the rested key on the next scans", async () => {
    const used: string[] = [];
    const pool = new KeyPool([K(1), K(2)]);
    const generate = async (key: string) => { used.push(key); if (key === K(1)) throw limited(); return tag; };
    await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    expect(used).toEqual([K(1), K(2), K(2), K(2)]); // K(1) tried once, then rested
  });

  it("spreads scans across keys when none are limited", async () => {
    const used: string[] = [];
    const pool = new KeyPool([K(1), K(2), K(3)]);
    const generate = async (key: string) => { used.push(key); return tag; };
    for (let i = 0; i < 6; i++) await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    expect(used).toEqual([K(1), K(2), K(3), K(1), K(2), K(3)]);
  });

  it("switches off a key Google rejects and carries on", async () => {
    const pool = new KeyPool([K(1), K(2)]);
    const r = await scanWithGemini(image, undefined, store, {
      pool, sleep: noSleep, generate: async (key) => { if (key === K(1)) throw invalid(); return tag; },
    });
    expect(r.status).toBe("ok");
    expect(pool.status()[0].state).toBe("disabled");
  });

  it("when every key is limited, answers with a friendly wait time and stops calling Google", async () => {
    let calls = 0;
    const pool = new KeyPool([K(1), K(2)]);
    const generate = async () => { calls++; throw limited(); };
    const r = await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    expect(r.status).toBe("error");
    expect(r.message).toMatch(/Try again in \d+ seconds/);
    expect(calls).toBe(2); // each key tried once
    const again = await scanWithGemini(image, undefined, store, { pool, sleep: noSleep, generate });
    expect(again.message).toMatch(/Try again in \d+ seconds/);
    expect(calls).toBe(2); // keys are resting: no new calls
  });

  it("retries a 503 once, then succeeds", async () => {
    let calls = 0;
    const pool = new KeyPool([K(1)]);
    const r = await scanWithGemini(image, undefined, store, {
      pool, sleep: noSleep,
      generate: async () => { calls++; if (calls === 1) throw new Error('{"error":{"code":503,"message":"high demand"}}'); return tag; },
    });
    expect(r.status).toBe("ok");
    expect(calls).toBe(2);
  });

  it("does not rotate on an ordinary failure", async () => {
    let calls = 0;
    const pool = new KeyPool([K(1), K(2)]);
    const r = await scanWithGemini(image, undefined, store, {
      pool, sleep: noSleep, generate: async () => { calls++; throw new Error("socket hang up"); },
    });
    expect(r.message).toBe("Couldn't read that photo right now.");
    expect(calls).toBe(1);
  });

  it("says scanning is not set up when there are no keys", async () => {
    const r = await scanWithGemini(image, undefined, store, { pool: new KeyPool([]), sleep: noSleep, generate: async () => tag });
    expect(r.message).toBe("Scanning isn't set up on this server.");
  });
});

describe("postProcess: model noise", () => {
  const store = generateSeedStore();
  it("matches on the product name, not a junk 'brand' field", () => {
    const r = postProcess({ isPriceTag: true, productName: "PLAIN GREEK YOGURT", brand: "SALTED BUTTER EVERYDAY PRICE", sizeText: "500 G", price: 5.97 }, store);
    expect(r.candidates[0].id).toBe("greek-yogurt-plain");
  });
  it("falls back to the full transcript when the name matches nothing", () => {
    const r = postProcess({ isPriceTag: true, productName: "XYZ", rawText: "SALTED BUTTER 454 G $5.99", sizeText: "454 G", price: 5.99 }, store);
    expect(r.candidates[0].id).toBe("butter-salted-454g");
  });
  it("drops an invented 'was' price that is not in the transcript, keeps a printed one", () => {
    const base = { isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99 };
    expect(postProcess({ ...base, wasPrice: 8.49, rawText: "SALTED BUTTER 454G WAS $8.49 $5.99" }, store).wasPrice).toBe(8.49);
    expect(postProcess({ ...base, wasPrice: 7.29, rawText: "SALTED BUTTER 454G $5.99" }, store).wasPrice).toBeUndefined();
  });
});

describe("scanWithGemini 503 spikes", () => {
  const store = generateSeedStore();
  it("survives two 503s in a row", async () => {
    let calls = 0;
    const r = await scanWithGemini({ data: Buffer.from("x"), mimeType: "image/png" }, undefined, store, {
      pool: new KeyPool(["AQ.spikekey_abcdefghijklmnopqrstuvwx"]), sleep: async () => {},
      generate: async () => { calls++; if (calls < 3) throw new Error('{"error":{"code":503,"message":"high demand"}}'); return JSON.stringify({ isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99 }); },
    });
    expect(r.status).toBe("ok");
    expect(calls).toBe(3);
  });
  it("gives up after the retries", async () => {
    let calls = 0;
    const r = await scanWithGemini({ data: Buffer.from("x"), mimeType: "image/png" }, undefined, store, {
      pool: new KeyPool(["AQ.spikekey_abcdefghijklmnopqrstuvwx"]), sleep: async () => {},
      generate: async () => { calls++; throw new Error('{"error":{"code":503,"message":"high demand"}}'); },
    });
    expect(r.status).toBe("error");
    expect(calls).toBe(3);
  });
});

describe("postProcess: invented multi-buy", () => {
  const store = generateSeedStore();
  const base = { isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99 };
  it("drops a multi-buy that is not in the transcript", () => {
    const r = postProcess({ ...base, multiBuyText: "2 for $5.00", rawText: "SALTED BUTTER 454 G WAS $8.49 $5.99" }, store);
    expect(r.multiBuy).toBeUndefined();
  });
  it("keeps a multi-buy the transcript confirms", () => {
    const r = postProcess({ ...base, productName: "Spaghetti", sizeText: "900 g", price: 2.5, multiBuyText: "2 for $5.00", rawText: "SPAGHETTI 900 G 2 FOR $5.00" }, store);
    expect(r.multiBuy).toEqual({ qty: 2, total: 5 });
  });
  it("keeps it when there is no transcript to check against", () => {
    expect(postProcess({ ...base, multiBuyText: "2 for $5.00" }, store).multiBuy).toEqual({ qty: 2, total: 5 });
  });
});

describe("scanWithGemini timeouts", () => {
  const store = generateSeedStore();
  const image = { data: Buffer.from("fake"), mimeType: "image/png" };
  const K = (n: number) => `AQ.timeoutkey${n}_abcdefghijklmnopqrstuvw`;
  const tag = JSON.stringify({ isPriceTag: true, productName: "Salted Butter", sizeText: "454 g", price: 5.99 });
  const hang = () => new Promise<string>(() => {});
  const fast = { sleep: async () => {}, attemptTimeoutMs: 30, totalTimeoutMs: 500 };

  it("moves to the next key when one does not answer in time", async () => {
    const used: string[] = [];
    const r = await scanWithGemini(image, undefined, store, {
      ...fast, pool: new KeyPool([K(1), K(2), K(3)]),
      generate: async (key) => { used.push(key); return key === K(1) ? hang() : tag; },
    });
    expect(r.status).toBe("ok");
    expect(used).toEqual([K(1), K(2)]);
  });

  it("cancels the request to the key that timed out", async () => {
    let signal: AbortSignal | undefined;
    await scanWithGemini(image, undefined, store, {
      ...fast, pool: new KeyPool([K(1), K(2)]),
      generate: async (key, _m, _i, s) => { if (key === K(1)) { signal = s; return hang(); } return tag; },
    });
    expect(signal?.aborted).toBe(true);
  });

  it("says the scan timed out when every key is too slow", async () => {
    let calls = 0;
    const r = await scanWithGemini(image, undefined, store, {
      ...fast, pool: new KeyPool([K(1), K(2)]), generate: () => { calls++; return hang(); },
    });
    expect(r.status).toBe("error");
    expect(r.message).toMatch(/timed out/i);
    expect(r.message).not.toMatch(/Couldn't read that photo/);
    expect(calls).toBe(2);
  });

  it("stops at the overall limit instead of trying every key for ever", async () => {
    let calls = 0;
    const started = Date.now();
    const r = await scanWithGemini(image, undefined, store, {
      sleep: async () => {}, attemptTimeoutMs: 40, totalTimeoutMs: 100,
      pool: new KeyPool([K(1), K(2), K(3), K(4), K(5), K(6)]), generate: () => { calls++; return hang(); },
    });
    expect(r.message).toMatch(/timed out/i);
    expect(calls).toBeLessThan(6);
    expect(Date.now() - started).toBeLessThan(400);
  });

  it("says Gemini is overloaded (not a generic error) after repeated 503s", async () => {
    const r = await scanWithGemini(image, undefined, store, {
      ...fast, pool: new KeyPool([K(1), K(2)]),
      generate: async () => { throw new Error('{"error":{"code":503,"message":"high demand"}}'); },
    });
    expect(r.message).toMatch(/overloaded/i);
  });

  it("rotates past a timeout and a rate limit in the same scan", async () => {
    const used: string[] = [];
    const r = await scanWithGemini(image, undefined, store, {
      ...fast, pool: new KeyPool([K(1), K(2), K(3)]),
      generate: async (key) => {
        used.push(key);
        if (key === K(1)) return hang();
        if (key === K(2)) throw new Error('{"error":{"code":429,"message":"Quota exceeded. Please retry in 30s."}}');
        return tag;
      },
    });
    expect(r.status).toBe("ok");
    expect(used).toEqual([K(1), K(2), K(3)]);
  });
});

describe("scan store-name coverage", () => {
  const store = generateSeedStore();
  it.each([
    ["SaveOnFoods", "saveon"], ["Save-On-Foods", "saveon"],
    ["NoFrills", "nofrills"], ["No Frills", "nofrills"],
    ["Walmart Canada", "walmart"], ["T&T Supermarket", "tnt"],
    ["TandT", "tnt"], ["T and T", "tnt"],
    ["Loblaws", "loblaws"], ["Metro", "metro"],
    ["Voilà by Sobeys", "voila"], ["Voila", "voila"],
    ["Galleria Supermarket", "galleria"],
    ["Unknown Grocer", undefined], ["Metropolitan Grocer", undefined],
  ])("recognizes %s without guessing an unknown chain", (storeName, retailerId) => {
    const result = postProcess({ productName: "Salted Butter", sizeText: "454 g", price: 5.99, storeName }, store);
    expect(result.retailerId).toBe(retailerId);
  });
});
