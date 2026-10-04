// Round-robin pool of Gemini API keys. A key that hits its rate limit is benched for the time Google asks for
// and the request moves on to the next key; a key Google rejects as invalid is switched off for this run.
// Keys come from GEMINI_API_KEYS (comma or newline separated) and/or GEMINI_API_KEY. They are never logged in full.

export type GeminiErrorKind = "rate_limit" | "bad_key" | "unavailable" | "other";

export interface KeySlot {
  key: string;
  /** safe to log: the last 4 characters only */
  label: string;
  coolUntil: number;
  disabled: boolean;
}

const DEFAULT_COOLDOWN_MS = 60_000;
const DAILY_QUOTA_COOLDOWN_MS = 60 * 60_000;
const MAX_COOLDOWN_MS = 2 * 60 * 60_000;

export function parseKeys(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = [env.GEMINI_API_KEYS ?? "", env.GEMINI_API_KEY ?? ""].join(",");
  // Only key-shaped tokens count, so a stray comment or label in .env can never become a "key"
  const keys = raw.split(/[\s,]+/).map((k) => k.trim()).filter((k) => /^[A-Za-z0-9._-]{20,}$/.test(k));
  return [...new Set(keys)];
}

export function classifyGeminiError(err: unknown): GeminiErrorKind {
  const msg = err instanceof Error ? err.message : String(err);
  if (/\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg)) return "rate_limit";
  if (/API_KEY_INVALID|API key not valid|API key expired|\b401\b|\b403\b|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) return "bad_key";
  if (/\b503\b|UNAVAILABLE|high demand|overloaded/i.test(msg)) return "unavailable";
  return "other";
}

/** How long to bench a key after a rate-limit error: Google's own "retry in 30s" hint, else a daily-quota or default wait. */
export function cooldownMsFor(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  if (/PerDay/i.test(msg)) return DAILY_QUOTA_COOLDOWN_MS;
  const hint = /retry in ([\d.]+)\s*s/i.exec(msg) ?? /"retryDelay"\s*:\s*"([\d.]+)s"/i.exec(msg);
  if (hint) return Math.min(MAX_COOLDOWN_MS, Math.ceil(Number(hint[1]) * 1000) + 1000);
  return DEFAULT_COOLDOWN_MS;
}

export class KeyPool {
  private slots: KeySlot[];
  private cursor = 0;

  constructor(keys: string[]) {
    this.slots = keys.map((key) => ({ key, label: `…${key.slice(-4)}`, coolUntil: 0, disabled: false }));
  }

  get size(): number {
    return this.slots.length;
  }

  /** The next usable key, rotating so load is spread across keys. null when every key is benched or switched off. */
  acquire(now = Date.now()): KeySlot | null {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[(this.cursor + i) % this.slots.length];
      if (!slot.disabled && slot.coolUntil <= now) {
        this.cursor = (this.cursor + i + 1) % this.slots.length;
        return slot;
      }
    }
    return null;
  }

  bench(slot: KeySlot, ms: number, now = Date.now()): void {
    slot.coolUntil = now + ms;
  }

  disable(slot: KeySlot): void {
    slot.disabled = true;
  }

  /** Milliseconds until some key is usable again; null if none ever will be (all keys switched off or no keys). */
  waitMs(now = Date.now()): number | null {
    const live = this.slots.filter((s) => !s.disabled);
    if (live.length === 0) return null;
    return Math.max(0, Math.min(...live.map((s) => s.coolUntil)) - now);
  }

  status(now = Date.now()): Array<{ key: string; state: "ready" | "cooling" | "disabled"; secondsLeft?: number }> {
    return this.slots.map((s) =>
      s.disabled
        ? { key: s.label, state: "disabled" as const }
        : s.coolUntil > now
          ? { key: s.label, state: "cooling" as const, secondsLeft: Math.ceil((s.coolUntil - now) / 1000) }
          : { key: s.label, state: "ready" as const },
    );
  }
}

let shared: { signature: string; pool: KeyPool } | null = null;

/** The process-wide pool; rebuilt if the configured keys change. */
export function getKeyPool(env: NodeJS.ProcessEnv = process.env): KeyPool {
  const keys = parseKeys(env);
  const signature = keys.join("|");
  if (!shared || shared.signature !== signature) {
    shared = { signature, pool: new KeyPool(keys) };
    if (keys.length > 0) console.log(`[Gemini] ${keys.length} API key${keys.length === 1 ? "" : "s"} loaded (${shared.pool.status().map((s) => s.key).join(", ")})`);
  }
  return shared.pool;
}
