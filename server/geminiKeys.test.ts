import { describe, expect, it } from "vitest";
import { KeyPool, classifyGeminiError, cooldownMsFor, parseKeys } from "./geminiKeys";

const K = (n: number) => `AQ.testkey${String(n).padStart(2, "0")}_abcdefghijklmnop`;

describe("parseKeys", () => {
  it("merges GEMINI_API_KEYS and GEMINI_API_KEY, in order, without duplicates", () => {
    const keys = parseKeys({ GEMINI_API_KEYS: `${K(1)},${K(2)}`, GEMINI_API_KEY: K(1) } as NodeJS.ProcessEnv);
    expect(keys).toEqual([K(1), K(2)]);
  });
  it("accepts commas, spaces and newlines", () => {
    expect(parseKeys({ GEMINI_API_KEYS: `${K(1)}\n${K(2)} , ${K(3)}` } as NodeJS.ProcessEnv)).toEqual([K(1), K(2), K(3)]);
  });
  it("ignores empty values and anything that is not key-shaped (comments, labels)", () => {
    expect(parseKeys({ GEMINI_API_KEYS: "# optional: several keys", GEMINI_API_KEY: "" } as NodeJS.ProcessEnv)).toEqual([]);
    expect(parseKeys({} as NodeJS.ProcessEnv)).toEqual([]);
  });
});

describe("classifyGeminiError", () => {
  it("recognises rate limits", () => {
    expect(classifyGeminiError(new Error('{"error":{"code":429,"status":"RESOURCE_EXHAUSTED"}}'))).toBe("rate_limit");
    expect(classifyGeminiError(new Error("You exceeded your current quota"))).toBe("rate_limit");
  });
  it("recognises keys Google rejects", () => {
    expect(classifyGeminiError(new Error('{"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}'))).toBe("bad_key");
    expect(classifyGeminiError(new Error('{"error":{"code":403,"status":"PERMISSION_DENIED"}}'))).toBe("bad_key");
  });
  it("recognises temporary unavailability and leaves everything else alone", () => {
    expect(classifyGeminiError(new Error('{"error":{"code":503,"message":"This model is currently experiencing high demand."}}'))).toBe("unavailable");
    expect(classifyGeminiError(new Error("Gemini scan timed out after 25s"))).toBe("other");
    expect(classifyGeminiError(new Error("Unexpected token < in JSON"))).toBe("other");
  });
});

describe("cooldownMsFor", () => {
  it("uses the wait Google asks for, plus a second of margin", () => {
    expect(cooldownMsFor(new Error("Please retry in 30.96s."))).toBe(31_960);
    expect(cooldownMsFor(new Error('"retryDelay":"30s"'))).toBe(31_000);
  });
  it("rests a key for an hour on a daily quota and a minute when told nothing", () => {
    expect(cooldownMsFor(new Error("GenerateRequestsPerDayPerProjectPerModel-FreeTier"))).toBe(3_600_000);
    expect(cooldownMsFor(new Error("429"))).toBe(60_000);
  });
});

describe("KeyPool", () => {
  it("rotates through keys round-robin", () => {
    const pool = new KeyPool([K(1), K(2), K(3)]);
    expect([1, 2, 3, 4, 5].map(() => pool.acquire()!.key)).toEqual([K(1), K(2), K(3), K(1), K(2)]);
  });
  it("skips a benched key until its rest is over", () => {
    const pool = new KeyPool([K(1), K(2)]);
    const first = pool.acquire(1000)!;
    pool.bench(first, 30_000, 1000);
    expect(pool.acquire(1000)!.key).toBe(K(2));
    expect(pool.acquire(2000)!.key).toBe(K(2));
    expect(pool.acquire(31_001)!.key).toBe(K(1));
  });
  it("never hands out a disabled key", () => {
    const pool = new KeyPool([K(1), K(2)]);
    pool.disable(pool.acquire()!);
    expect([1, 2, 3].map(() => pool.acquire()!.key)).toEqual([K(2), K(2), K(2)]);
  });
  it("returns null when every key is resting, and reports how long to wait", () => {
    const pool = new KeyPool([K(1), K(2)]);
    pool.bench(pool.acquire(0)!, 20_000, 0);
    pool.bench(pool.acquire(0)!, 45_000, 0);
    expect(pool.acquire(1000)).toBeNull();
    expect(pool.waitMs(1000)).toBe(19_000);
  });
  it("has no wait time when every key is switched off, and labels never contain the full key", () => {
    const pool = new KeyPool([K(1)]);
    pool.disable(pool.acquire()!);
    expect(pool.waitMs()).toBeNull();
    expect(JSON.stringify(pool.status())).not.toContain(K(1));
  });
});
