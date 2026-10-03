import type { Unit } from "@shared/types";

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 5.99 -> "$5.99" */
export function formatMoney(n: number): string {
  return money.format(n);
}

/** (13.2, "kg") -> "$13.20/kg" */
export function formatUnitPrice(n: number, unit: Unit): string {
  return `${formatMoney(n)}/${unit}`;
}

/** -0.31 -> "31% below average", 0.12 -> "12% above average", 0.001 -> "right at average" */
export function formatPct(p: number): string {
  if (p < -0.005) return `${Math.round(Math.abs(p) * 100)}% below average`;
  if (p > 0.005) return `${Math.round(p * 100)}% above average`;
  return "right at average";
}

/** (0.454, "kg") -> "454 g", (4, "L") -> "4 L", (6, "each") -> "6 pack", (1, "dozen") -> "dozen" */
export function formatSize(qty: number, unit: Unit): string {
  const trim = (n: number) => String(Math.round(n * 100) / 100);
  switch (unit) {
    case "kg": return qty < 1 ? `${Math.round(qty * 1000)} g` : `${trim(qty)} kg`;
    case "L": return qty < 1 ? `${Math.round(qty * 1000)} mL` : `${trim(qty)} L`;
    case "each": return qty > 1 ? `${trim(qty)} pack` : "each";
    case "dozen": return qty === 1 ? "dozen" : `${trim(qty)} dozen`;
  }
}

/** ISO -> "just now", "12 minutes ago", "2 hours ago", "3 days ago" */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const secs = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** "2026-09-21" -> "Week of Sep 21" */
export function formatWeek(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return `Week of ${d.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })}`;
}

/** 1.23 km -> "1.2 km", 0.35 -> "350 m", 12.4 -> "12 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000 / 10) * 10} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
