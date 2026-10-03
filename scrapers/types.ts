// FROZEN contract between BE-01 (core), BE-02..05 (adapters), BE-06 (runner) and BE-08 (scan).
import type { GeoPoint, RetailerId } from "../shared/types";

export interface RawProduct {
  title: string;
  brand?: string;
  sizeText?: string;
  price: number;
  regularPrice?: number;
  wasPrice?: number;
  multiBuyText?: string;
  onSale?: boolean;
  unitPriceText?: string;
  url?: string;
  storeRef?: string;
}

export interface AdapterResult {
  status: "ok" | "partial" | "blocked" | "error";
  message?: string;
  products: RawProduct[];
}

export interface BranchInfo { name: string; address: string; lat: number; lng: number; scrapeStoreId: string }

export interface AdapterContext {
  /** polite HTTP: delay, timeout, retry, cache, block detection (BE-01) */
  fetchText: (url: string, init?: RequestInit) => Promise<{ status: number; text: string; fromCache: boolean }>;
  fetchJson: <T = unknown>(url: string, init?: RequestInit) => Promise<{ status: number; data: T; fromCache: boolean }>;
  /** shared Playwright page factory (BE-01); call only if plain fetch can't work */
  newPage: () => Promise<import("playwright").Page>;
  log: (msg: string) => void;
}

export interface RetailerAdapter {
  retailerId: RetailerId;
  /** search the store's site for one item; branchRef = the chain's own store id for branch pricing, if supported */
  search(query: string, ctx: AdapterContext, branchRef?: string): Promise<AdapterResult>;
  /** optional: list branches near a point, used once to fill scrapeStoreId values */
  findBranches?(near: GeoPoint, ctx: AdapterContext): Promise<BranchInfo[]>;
}

export class BlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedError";
  }
}
