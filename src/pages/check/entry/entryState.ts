import type { Item, RetailerId, Unit } from "@shared/types";
import { RETAILERS } from "@shared/retailers";

export type EntryStep = 1 | 2 | 3;

export interface EntryFormState {
  step: EntryStep;
  retailerId: RetailerId | null;
  price: string;
  hasWasPrice: boolean;
  wasPrice: string;
  hasMultiBuy: boolean;
  multiBuyQty: number;
  multiBuyTotal: string;
  hasCustomSize: boolean;
  customSize: string;
}

/** Converts raw custom size input to sizeQty in item units (g -> kg, mL -> L). */
export function toItemSizeQty(value: string, unit: Unit): number | undefined {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  if (unit === "kg" || unit === "L") {
    return n / 1000;
  }
  return n;
}

/** Converts item-unit sizeQty from query param to display string (kg -> g, L -> mL). */
export function toDisplaySize(sizeInItemUnits: string, unit: Unit): string {
  const n = Number.parseFloat(sizeInItemUnits);
  if (!Number.isFinite(n)) return sizeInItemUnits;
  if (unit === "kg" || unit === "L") {
    return String(Math.round(n * 1000));
  }
  return String(n);
}

/** Parses query params into initial entry form state. */
export function parseInitialEntryState(
  params: URLSearchParams,
  item?: Item,
): EntryFormState {
  const storeParam = params.get("store") as RetailerId | null;
  const validStore = storeParam && RETAILERS.some((r) => r.id === storeParam) ? storeParam : null;

  const priceParam = params.get("price") ?? "";
  const wasParam = params.get("was") ?? "";
  const mbqParam = Number.parseInt(params.get("mbq") ?? "2", 10);
  const mbtParam = params.get("mbt") ?? "";
  const sizeParam = params.get("size") ?? "";

  const unit = item?.unit ?? "kg";
  const displaySize = sizeParam ? toDisplaySize(sizeParam, unit) : "";

  const hasWasPrice = Boolean(wasParam);
  const hasMultiBuy = Boolean(mbtParam);
  const hasCustomSize = Boolean(sizeParam) && unit !== "dozen";

  // Determine step: if step param is provided, use it; else if store & price present -> 3; else if store -> 2; else 1
  const stepParam = params.get("step");
  let step: EntryStep = 1;
  if (stepParam === "1" || stepParam === "2" || stepParam === "3") {
    step = Number.parseInt(stepParam, 10) as EntryStep;
  } else if (validStore && priceParam && Number.parseFloat(priceParam) > 0) {
    step = 3;
  } else if (validStore) {
    step = 2;
  }

  return {
    step,
    retailerId: validStore,
    price: priceParam,
    hasWasPrice,
    wasPrice: wasParam,
    hasMultiBuy,
    multiBuyQty: Number.isFinite(mbqParam) && mbqParam >= 2 && mbqParam <= 6 ? mbqParam : 2,
    multiBuyTotal: mbtParam,
    hasCustomSize,
    customSize: displaySize,
  };
}