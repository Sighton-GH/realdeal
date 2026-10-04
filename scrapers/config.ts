import type { RetailerId } from "../shared/types";

export const SCRAPE_CONFIG: Partial<Record<RetailerId, { enabled: boolean; delayMs: number; notes?: string }>> = {
  saveon: { enabled: true, delayMs: 2500 },
  nofrills: { enabled: true, delayMs: 2500 },
  walmart: { enabled: true, delayMs: 2500 },
  tnt: { enabled: true, delayMs: 2500 },
};