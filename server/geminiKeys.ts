// Pool of Gemini API keys. Each key's requests are counted against its free-tier limits (requests a minute, requests
// a day, tokens a minute) and a key that is full is skipped before any request is sent, so scans never wait on a
// 429. If Google rate limits a key anyway, it is benched for the time Google asks for and the request moves on to
// the next key; a key Google rejects as invalid is switched off for this run.
// Keys come from GEMINI_API_KEYS (comma or newline separated) and/or GEMINI_API_KEY. They are never logged in full.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export type GeminiErrorKind = "rate_limit" | "bad_key" | "unavailable" | "other";

export interface KeySlot {
  key: string;
  /** safe to log: the last 4 characters only */
  label: string;
  coolUntil: number;
  disabled: boolean;
  /** start times of requests sent in the last minute */
  recent: number[];
  /** tokens used in the last minute */
  recentTokens: Array<{ at: number; tokens: number }>;
  /** Pacific-time date the daily count belongs to (Google resets free-tier daily quotas at midnight Pacific) */
  day: string;
  dayCount: number;
}

/** Free-tier limits per key for the scan model. Override with GEMINI_RPM, GEMINI_RPD and GEMINI_TPM. */
export interface KeyLimits {
  rpm: number;
  rpd: number;
  tpm: number;
}

// gemini-3.8-flash free tier: 5 requests a minute, 20 a day, 250K tokens a minute
export const DEFAULT_LIMITS: KeyLimits = { rpm: 5, rpd: 20, tpm: 250_000 };

/** Saves daily counts so a server restart doesn't send requests to keys that are already full for the day. */
export interface UsageStore {
  load(): Record<string, { day: string; count: number }>;
  save(data: Record<string, { day: string; count: number }>): void;
}

const MINUTE_MS = 60_000;
const DEFAULT_COOLDOWN_MS = 60_000;
const DAILY_QUOTA_COOLDOWN_MS = 60 * 60_000;
const MAX_COOLDOWN_MS = 2 * 60 * 60_000;

export function parseKeys(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = [env.GEMINI_API_KEYS ?? "", env.GEMINI_API_KEY ?? ""].join(",");
  // Only key-shaped tokens count, so a stray comment or label in .env can never become a "key"
  const keys = raw.split(/[\s,]+/).map((k) => k.trim()).filter((k) => /^[A-Za-z0-9._-]{20,}$/.test(k));
  return [...new Set(keys)];
}

export function parseLimits(env: NodeJS.ProcessEnv = process.env): KeyLimits {
  const num = (v: string | undefined, fallback: number) => {
    const n = Number(v);
    return v && Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    rpm: num(env.GEMINI_RPM, DEFAULT_LIMITS.rpm),
    rpd: num(env.GEMINI_RPD, DEFAULT_LIMITS.rpd),
    tpm: num(env.GEMINI_TPM, DEFAULT_LIMITS.tpm),
  };
}

const pacificDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });

/** The Pacific-time calendar date, e.g. "2026-10-04". */
export function quotaDay(now: number): string {
  return pacificDate.format(now);
}

/** Milliseconds until the Pacific date changes (the daily quota resets). */
export function msUntilQuotaReset(now: number): number {
  const today = quotaDay(now);
  // Step forward an hour at a time, then a minute at a time; DST-safe without timezone maths
  let t = now;
  while (quotaDay(t + 3_600_000) === today) t += 3_600_000;
  while (quotaDay(t) === today) t += MINUTE_MS;
  return t - now;
}

export function classifyGeminiError(err: unknown): GeminiErrorKind {
  const msg = err instanceof Error ? err.message : String(err);
  if (/\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg)) return "rate_limit";
  if (/API_KEY_INVALID|API key not valid|API key expired|\b401\b|\b403\b|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) return "bad_key";
  if (/\b503\b|UNAVAILABLE|high demand|overloaded/i.test(msg)) return "unavailable";
  return "other";
}

/** True when a rate-limit error is about the daily quota rather than the per-minute one. */
export function isDailyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /PerDay/i.test(msg);
}

/** How long to bench a key after a rate-limit error: Google's own "retry in 30s" hint, else a daily-quota or default wait. */
export function cooldownMsFor(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  if (isDailyQuotaError(err)) return DAILY_QUOTA_COOLDOWN_MS;
  const hint = /retry in ([\d.]+)\s*s/i.exec(msg) ?? /"retryDelay"\s*:\s*"([\d.]+)s"/i.exec(msg);
  if (hint) return Math.min(MAX_COOLDOWN_MS, Math.ceil(Number(hint[1]) * 1000) + 1000);
  return DEFAULT_COOLDOWN_MS;
}

export type KeyState = "ready" | "cooling" | "minute_full" | "day_full" | "disabled";

/**
 * Hands out the key with the most room left. Every request is counted against the key's per-minute and per-day
 * limits, so a key that is full is skipped without spending a request on it.
 */
export class KeyPool {
  private slots: KeySlot[];
  private cursor = 0;
  readonly limits: KeyLimits;
  private store?: UsageStore;

  constructor(keys: string[], limits: KeyLimits = DEFAULT_LIMITS, store?: UsageStore, now = Date.now()) {
    this.limits = limits;
    this.store = store;
    const today = quotaDay(now);
    const saved = store ? safeLoad(store) : {};
    this.slots = keys.map((key) => {
      const s = saved[usageId(key)];
      return {
        key,
        label: `…${key.slice(-4)}`,
        coolUntil: 0,
        disabled: false,
        recent: [],
        recentTokens: [],
        day: today,
        dayCount: s && s.day === today ? s.count : 0,
      };
    });
  }

  get size(): number {
    return this.slots.length;
  }

  private refresh(slot: KeySlot, now: number): void {
    const cutoff = now - MINUTE_MS;
    slot.recent = slot.recent.filter((t) => t > cutoff);
    slot.recentTokens = slot.recentTokens.filter((t) => t.at > cutoff);
    const today = quotaDay(now);
    if (slot.day !== today) {
      slot.day = today;
      slot.dayCount = 0;
    }
  }

  private stateOf(slot: KeySlot, now: number): KeyState {
    this.refresh(slot, now);
    if (slot.disabled) return "disabled";
    if (slot.dayCount >= this.limits.rpd) return "day_full";
    if (slot.coolUntil > now) return "cooling";
    const tokens = slot.recentTokens.reduce((sum, t) => sum + t.tokens, 0);
    if (slot.recent.length >= this.limits.rpm || tokens >= this.limits.tpm) return "minute_full";
    return "ready";
  }

  /**
   * The ready key with the most room (fewest requests this minute, then today), counted as used straight away so
   * scans running at the same time spread across keys. null when every key is full, resting or switched off.
   */
  acquire(now = Date.now()): KeySlot | null {
    let best: KeySlot | null = null;
    let bestIndex = 0;
    for (let i = 0; i < this.slots.length; i++) {
      const index = (this.cursor + i) % this.slots.length;
      const slot = this.slots[index];
      if (this.stateOf(slot, now) !== "ready") continue;
      if (!best || slot.recent.length < best.recent.length || (slot.recent.length === best.recent.length && slot.dayCount < best.dayCount)) {
        best = slot;
        bestIndex = index;
      }
    }
    if (!best) return null;
    this.cursor = (bestIndex + 1) % this.slots.length;
    best.recent.push(now);
    best.dayCount++;
    if (best.dayCount >= this.limits.rpd) console.warn(`[Gemini] key ${best.label} has used its ${this.limits.rpd} requests for today; skipping it until midnight Pacific`);
    this.persist();
    return best;
  }

  /** Counts the tokens a finished request used against the key's per-minute token limit. */
  recordTokens(slot: KeySlot, tokens: number, now = Date.now()): void {
    if (tokens > 0) slot.recentTokens.push({ at: now, tokens });
  }

  bench(slot: KeySlot, ms: number, now = Date.now()): void {
    slot.coolUntil = now + ms;
  }

  /** Google says the key's daily quota is used up: mark it full until the quota resets. */
  markDayFull(slot: KeySlot, now = Date.now()): void {
    this.refresh(slot, now);
    slot.dayCount = Math.max(slot.dayCount, this.limits.rpd);
    this.persist();
  }

  disable(slot: KeySlot): void {
    slot.disabled = true;
  }

  private msUntilReady(slot: KeySlot, now: number): number | null {
    const state = this.stateOf(slot, now);
    if (state === "disabled") return null;
    if (state === "day_full") return msUntilQuotaReset(now);
    let wait = Math.max(0, slot.coolUntil - now);
    if (slot.recent.length >= this.limits.rpm) wait = Math.max(wait, slot.recent[slot.recent.length - this.limits.rpm] + MINUTE_MS - now);
    if (slot.recentTokens.reduce((sum, t) => sum + t.tokens, 0) >= this.limits.tpm && slot.recentTokens.length > 0) {
      wait = Math.max(wait, slot.recentTokens[0].at + MINUTE_MS - now);
    }
    return wait;
  }

  /** Milliseconds until some key is usable again; null if none ever will be (all keys switched off or no keys). */
  waitMs(now = Date.now()): number | null {
    const waits = this.slots.map((s) => this.msUntilReady(s, now)).filter((w): w is number => w !== null);
    return waits.length === 0 ? null : Math.min(...waits);
  }

  status(now = Date.now()): Array<{ key: string; state: KeyState; usedThisMinute: number; usedToday: number; secondsLeft?: number }> {
    return this.slots.map((s) => {
      const state = this.stateOf(s, now);
      const wait = state === "ready" ? null : this.msUntilReady(s, now);
      return {
        key: s.label,
        state,
        usedThisMinute: s.recent.length,
        usedToday: s.dayCount,
        ...(wait !== null && wait > 0 ? { secondsLeft: Math.ceil(wait / 1000) } : {}),
      };
    });
  }

  private persist(): void {
    if (!this.store) return;
    const data: Record<string, { day: string; count: number }> = {};
    for (const s of this.slots) data[usageId(s.key)] = { day: s.day, count: s.dayCount };
    try {
      this.store.save(data);
    } catch {
      // usage tracking is best effort; scanning must not fail because the file couldn't be written
    }
  }
}

/** A short one-way id for a key, so the usage file never contains the key itself. */
function usageId(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

function safeLoad(store: UsageStore): Record<string, { day: string; count: number }> {
  try {
    return store.load();
  } catch {
    return {};
  }
}

const USAGE_FILE = fileURLToPath(new URL("../data/gemini-usage.json", import.meta.url));

/** Daily counts in data/gemini-usage.json (gitignored), keyed by a hash of each key. */
export const fileUsageStore: UsageStore = {
  load() {
    if (!existsSync(USAGE_FILE)) return {};
    return JSON.parse(readFileSync(USAGE_FILE, "utf8")) as Record<string, { day: string; count: number }>;
  },
  save(data) {
    mkdirSync(dirname(USAGE_FILE), { recursive: true });
    writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  },
};

let shared: { signature: string; pool: KeyPool } | null = null;

/** The process-wide pool; rebuilt if the configured keys change. */
export function getKeyPool(env: NodeJS.ProcessEnv = process.env): KeyPool {
  const keys = parseKeys(env);
  const limits = parseLimits(env);
  const signature = [keys.join("|"), limits.rpm, limits.rpd, limits.tpm].join("/");
  if (!shared || shared.signature !== signature) {
    shared = { signature, pool: new KeyPool(keys, limits, fileUsageStore) };
    if (keys.length > 0) {
      const full = shared.pool.status().filter((s) => s.state === "day_full").length;
      console.log(
        `[Gemini] ${keys.length} API key${keys.length === 1 ? "" : "s"} loaded (${shared.pool.status().map((s) => s.key).join(", ")}); ` +
          `limits ${limits.rpm}/min, ${limits.rpd}/day per key${full ? `; ${full} already full for today` : ""}`,
      );
    }
  }
  return shared.pool;
}
