import type { GeoPoint, MultiBuy, Unit, VerdictTier } from "../types";

/** 5.99 -> "$5.99". Local on purpose: shared/ must not import from src/. */
export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Effective price: the per-unit multi-buy price when there is a multi-buy, else the shelf price. */
export function effectivePrice(price: number, multiBuy?: MultiBuy): number {
  return multiBuy ? multiBuy.total / multiBuy.qty : price;
}

/** Price per kg / L / each / dozen. Never rounded here; round only for display. */
export function unitPriceOf(price: number, sizeQty: number, multiBuy?: MultiBuy): number {
  return effectivePrice(price, multiBuy) / sizeQty;
}

export function tierFor(pct: number): VerdictTier {
  if (pct <= -0.25) return "steal";
  if (pct <= -0.1) return "good";
  if (pct <= 0.1) return "normal";
  return "high";
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "0.454 kg" -> "454 g", "0.5 L" -> "500 mL", 6 each -> "6 pack", 1 dozen -> "dozen". */
export function formatSize(qty: number, unit: Unit): string {
  const r = (n: number) => String(Math.round(n * 100) / 100);
  switch (unit) {
    case "kg": return qty < 1 ? `${Math.round(qty * 1000)} g` : `${r(qty)} kg`;
    case "L": return qty < 1 ? `${Math.round(qty * 1000)} mL` : `${r(qty)} L`;
    case "each": return `${r(qty)} pack`;
    case "dozen": return qty === 1 ? "dozen" : `${r(qty)} dozen`;
  }
}

export function unitWord(unit: Unit): string {
  return unit === "each" ? "item" : unit;
}

export function newCheckId(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2).padEnd(8, "0");
  return id.slice(0, 8);
}
