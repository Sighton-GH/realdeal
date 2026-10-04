import { describe, expect, it } from "vitest";
import { KeyPool, classifyGeminiError, cooldownMsFor, msUntilQuotaReset, parseKeys, parseLimits, quotaDay, type UsageStore } from "./geminiKeys";

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

describe("KeyPool limits", () => {
  // 2026-10-04 10:00 Pacific (17:00 UTC)
  const T = Date.UTC(2026, 9, 4, 17, 0, 0);
  const limits = { rpm: 5, rpd: 20, tpm: 250_000 };

  it("reads limits from the environment, falling back to the free-tier defaults", () => {
    expect(parseLimits({} as NodeJS.ProcessEnv)).toEqual(limits);
    expect(parseLimits({ GEMINI_RPM: "10", GEMINI_RPD: "abc" } as NodeJS.ProcessEnv)).toEqual({ ...limits, rpm: 10 });
  });

  it("marks a key full for the minute after 5 requests and hands it out again a minute later", () => {
    const pool = new KeyPool([K(1)], limits, undefined, T);
    for (let i = 0; i < 5; i++) expect(pool.acquire(T + i)).not.toBeNull();
    expect(pool.acquire(T + 10)).toBeNull();
    expect(pool.status(T + 10)[0].state).toBe("minute_full");
    expect(pool.waitMs(T + 10)).toBe(60_000 - 10);
    expect(pool.acquire(T + 60_001)).not.toBeNull();
  });

  it("prefers the key with the most room left", () => {
    const pool = new KeyPool([K(1), K(2), K(3)], limits, undefined, T);
    pool.acquire(T); // K1
    pool.acquire(T); // K2
    pool.acquire(T); // K3
    pool.acquire(T); // K1
    pool.acquire(T); // K2
    expect(pool.acquire(T)!.key).toBe(K(3));
  });

  it("marks a key full for the day after 20 requests, until midnight Pacific", () => {
    const pool = new KeyPool([K(1), K(2)], limits, undefined, T);
    for (let i = 0; i < 40; i++) expect(pool.acquire(T + i * 61_000)).not.toBeNull();
    const later = T + 40 * 61_000; // still the same Pacific day
    expect(pool.acquire(later)).toBeNull();
    expect(pool.status(later).map((s) => s.state)).toEqual(["day_full", "day_full"]);
    expect(pool.waitMs(later)).toBe(msUntilQuotaReset(later));
    const nextDay = Date.UTC(2026, 9, 5, 7, 1, 0); // 00:01 Pacific
    expect(pool.acquire(nextDay)).not.toBeNull();
  });

  it("knows when the Pacific day changes", () => {
    expect(quotaDay(T)).toBe("2026-10-04");
    expect(quotaDay(Date.UTC(2026, 9, 5, 6, 59))).toBe("2026-10-04");
    expect(quotaDay(Date.UTC(2026, 9, 5, 7, 0))).toBe("2026-10-05");
    expect(msUntilQuotaReset(T)).toBe(14 * 3_600_000);
  });

  it("marks a key full when Google says its daily quota is gone", () => {
    const pool = new KeyPool([K(1), K(2)], limits, undefined, T);
    pool.markDayFull(pool.acquire(T)!, T);
    expect(pool.status(T)[0].state).toBe("day_full");
    expect(pool.acquire(T + 1)!.key).toBe(K(2));
  });

  it("marks a key full when it has used its tokens for the minute", () => {
    const pool = new KeyPool([K(1), K(2)], limits, undefined, T);
    pool.recordTokens(pool.acquire(T)!, 250_000, T);
    expect(pool.status(T + 1)[0].state).toBe("minute_full");
    expect(pool.acquire(T + 1)!.key).toBe(K(2));
    expect(pool.acquire(T + 2)!.key).toBe(K(2));
  });

  it("remembers today's counts across restarts without storing the keys", () => {
    let saved: Record<string, { day: string; count: number }> = {};
    const store: UsageStore = { load: () => saved, save: (d) => { saved = d; } };
    const first = new KeyPool([K(1), K(2)], limits, store, T);
    for (let i = 0; i < 20; i++) first.acquire(T + i * 61_000);
    expect(JSON.stringify(saved)).not.toContain(K(1));
    const restarted = new KeyPool([K(1), K(2)], limits, store, T + 30 * 61_000);
    expect(restarted.status(T + 30 * 61_000).map((s) => s.usedToday)).toEqual([10, 10]);
    const tomorrow = new KeyPool([K(1), K(2)], limits, store, Date.UTC(2026, 9, 5, 8));
    expect(tomorrow.status(Date.UTC(2026, 9, 5, 8)).map((s) => s.usedToday)).toEqual([0, 0]);
  });
});
