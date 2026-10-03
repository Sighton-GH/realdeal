import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserContext, Page } from "playwright";
import type { RetailerId } from "../shared/types";
import { getBrowser } from "./browser";
import { SCRAPE_CONFIG } from "./config";
import { type AdapterContext, BlockedError } from "./types";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": DEFAULT_USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/json,*/*;q=0.8",
  "Accept-Language": "en-CA,en;q=0.9",
};

const CHALLENGE_MARKERS = [
  "captcha",
  "are you a robot",
  "access denied",
  "cf-chl",
  "px-captcha",
  "perimeterx",
  "datadome",
];

// Per-retailer serialized queue state
const lastRequestTimeByRetailer = new Map<RetailerId, number>();
const queuePromiseByRetailer = new Map<RetailerId, Promise<void>>();

async function enqueue<T>(retailerId: RetailerId, delayMs: number, fn: () => Promise<T>): Promise<T> {
  const prev = queuePromiseByRetailer.get(retailerId) ?? Promise.resolve();
  let resolveNext!: () => void;
  const next = new Promise<void>((r) => {
    resolveNext = r;
  });
  queuePromiseByRetailer.set(retailerId, next);

  try {
    await prev;
    const now = Date.now();
    const last = lastRequestTimeByRetailer.get(retailerId) ?? 0;
    const elapsed = now - last;
    if (elapsed < delayMs) {
      await new Promise((r) => setTimeout(r, delayMs - elapsed));
    }
    const result = await fn();
    lastRequestTimeByRetailer.set(retailerId, Date.now());
    return result;
  } finally {
    resolveNext();
  }
}

function checkBlocked(status: number, text: string): void {
  if (status === 403 || status === 429) {
    throw new BlockedError(`Blocked with HTTP status ${status}`);
  }
  const lower = text.toLowerCase();
  for (const marker of CHALLENGE_MARKERS) {
    if (lower.includes(marker)) {
      throw new BlockedError(`Challenge detected: marker "${marker}" found in response`);
    }
  }
}

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  async function doFetch(): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const mergedHeaders = {
        ...DEFAULT_HEADERS,
        ...(init?.headers as Record<string, string> | undefined),
      };
      return await fetch(url, {
        ...init,
        headers: mergedHeaders,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    const res = await doFetch();
    if (res.status >= 500) {
      // 5xx error -> retry once after 5s
      await new Promise((r) => setTimeout(r, 5000));
      return await doFetch();
    }
    return res;
  } catch {
    // Network / abort error -> retry once after 5s
    await new Promise((r) => setTimeout(r, 5000));
    return await doFetch();
  }
}

export interface CreateContextOptions {
  retailerId: RetailerId;
  delayMs?: number;
  cacheDir?: string;
  useCache?: boolean;
  log?: (m: string) => void;
}

export function createContext(
  opts: CreateContextOptions,
): AdapterContext & { close(): Promise<void> } {
  const {
    retailerId,
    delayMs = SCRAPE_CONFIG[opts.retailerId]?.delayMs ?? 2500,
    cacheDir,
    useCache = false,
    log = (m: string) => void m,
  } = opts;

  const browserContexts: BrowserContext[] = [];

  function getCacheFilePath(url: string, body?: BodyInit | null): string | null {
    if (!cacheDir) return null;
    const bodyStr = typeof body === "string" ? body : "";
    const hash = createHash("sha1").update(`${url}#${bodyStr}`).digest("hex");
    return path.join(cacheDir, `${hash}.json`);
  }

  const fetchText = async (
    url: string,
    init?: RequestInit,
  ): Promise<{ status: number; text: string; fromCache: boolean }> => {
    const cacheFile = getCacheFilePath(url, init?.body);

    if (cacheFile && useCache) {
      try {
        const raw = await fs.readFile(cacheFile, "utf-8");
        const parsed = JSON.parse(raw) as { status: number; text: string };
        log(`Cache hit for ${url}`);
        return { status: parsed.status, text: parsed.text, fromCache: true };
      } catch {
        // Cache miss
      }
    }

    // Network request scheduled through queue
    return enqueue(retailerId, delayMs, async () => {
      log(`Fetching ${url} (delay: ${delayMs}ms)`);
      const res = await fetchWithRetry(url, init);
      const text = await res.text();

      checkBlocked(res.status, text);

      if (cacheFile && res.status < 400) {
        try {
          await fs.mkdir(path.dirname(cacheFile), { recursive: true });
          await fs.writeFile(cacheFile, JSON.stringify({ status: res.status, text }), "utf-8");
        } catch (err) {
          log(`Failed to write cache: ${String(err)}`);
        }
      }

      return { status: res.status, text, fromCache: false };
    });
  };

  const fetchJson = async <T = unknown>(
    url: string,
    init?: RequestInit,
  ): Promise<{ status: number; data: T; fromCache: boolean }> => {
    const res = await fetchText(url, init);
    const data = JSON.parse(res.text) as T;
    return { status: res.status, data, fromCache: res.fromCache };
  };

  const newPage = async (): Promise<Page> => {
    const browser = await getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      locale: "en-CA",
      timezoneId: "America/Vancouver",
      userAgent: DEFAULT_USER_AGENT,
    });
    browserContexts.push(context);
    return context.newPage();
  };

  const close = async (): Promise<void> => {
    for (const ctx of browserContexts) {
      try {
        await ctx.close();
      } catch {
        // Ignore errors on close
      }
    }
    browserContexts.length = 0;
  };

  return {
    fetchText,
    fetchJson,
    newPage,
    log,
    close,
  };
}