import fs from "node:fs";
import path from "node:path";
import { generateSeedStore } from "../shared/seed/generate";
import type { PriceStore } from "../shared/types";
import { syncToTiger } from "./tiger";

let currentStore: PriceStore = generateSeedStore();
let watcherStarted = false;
let reloadTimer: NodeJS.Timeout | null = null;

const DATA_DIR = path.resolve(process.cwd(), "data");
const PRICES_PATH = path.join(DATA_DIR, "prices.json");

function validatePriceStore(obj: unknown): obj is PriceStore {
  if (!obj || typeof obj !== "object") return false;
  const s = obj as Partial<PriceStore>;
  return (
    Array.isArray(s.items) &&
    Array.isArray(s.points) &&
    Array.isArray(s.locations)
  );
}

function loadStoreFromFile(): boolean {
  if (!fs.existsSync(PRICES_PATH)) {
    return false;
  }
  try {
    const raw = fs.readFileSync(PRICES_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (validatePriceStore(parsed)) {
      currentStore = parsed;
      console.log(`[Data] Loaded ${parsed.points.length} price points from ${PRICES_PATH}`);
      syncToTiger(currentStore).catch(() => {});
      return true;
    } else {
      console.warn(`[Data] ${PRICES_PATH} exists but failed schema validation (missing items, points, or locations)`);
      return false;
    }
  } catch (err) {
    console.error(`[Data] Error reading ${PRICES_PATH}:`, err);
    return false;
  }
}

// Initial load
if (!loadStoreFromFile()) {
  currentStore = generateSeedStore();
  console.log(`[Data] Initialized with generated seed store (${currentStore.points.length} points)`);
  syncToTiger(currentStore).catch(() => {});
}

export function getStore(): PriceStore {
  return currentStore;
}

export function startDataWatcher(): void {
  if (watcherStarted) return;
  watcherStarted = true;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.watch(DATA_DIR, (_eventType, filename) => {
      if (filename === "prices.json" || !filename) {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          if (loadStoreFromFile()) {
            console.log(`[DataWatcher] Reloaded price store on file change: ${PRICES_PATH}`);
          }
        }, 500);
      }
    });

    console.log(`[DataWatcher] Watching directory: ${DATA_DIR}`);
  } catch (err) {
    console.warn(`[DataWatcher] Could not start directory watch on ${DATA_DIR}:`, err);
  }
}