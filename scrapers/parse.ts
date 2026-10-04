import type { MultiBuy, Unit } from "../shared/types";

/**
 * Parses package size or unit from text.
 * Examples:
 * "454 g" -> { qty: 0.454, unit: "kg" }
 * "4 L" -> { qty: 4, unit: "L" }
 * "500 mL" -> { qty: 0.5, unit: "L" }
 * "12 pack", "12 x 1", "6 pk" -> { qty: ..., unit: "each" }
 * "dozen", "12 eggs" -> { qty: 1, unit: "dozen" }
 * "per kg", "/kg" -> { qty: 1, unit: "kg" }
 * "per lb", "/lb" -> { qty: 1, unit: "kg" }
 * "3 lb bag" -> { qty: 1.36, unit: "kg" }
 */
export function parseSize(text: string): { qty: number; unit: Unit } | null {
  if (!text) return null;
  const t = text.toLowerCase().replace(",", ".")
    .replace(/\bmillilit(?:re|er)s?\b/g, "ml")
    .replace(/\bkilograms?\b/g, "kg")
    .replace(/\bgrams?\b/g, "g")
    .replace(/\blit(?:re|er)s?\b/g, "l")
    .replace(/\bpounds?\b/g, "lb")
    .replace(/\ballpurpose\b/g, "all purpose");

  // Multipacks with an explicit unit: "2 x 454 g" is 0.908 kg, "12 x 355 mL" is 4.26 L ("12 x 1" is handled below)
  const multipack = t.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?\s*(?:kg|g|ml|l)\b)/);
  if (multipack) {
    const inner = parseSize(multipack[2]);
    if (inner) return { qty: Math.round(Number(multipack[1]) * inner.qty * 10000) / 10000, unit: inner.unit };
  }

  // Per-weight produce markers
  if (/(?:^|\s|\/)(?:per\s*kg|\/kg|kg)\b/.test(t) && !/\d+\s*kg\b/.test(t)) {
    return { qty: 1, unit: "kg" };
  }
  if (/(?:^|\s|\/)(?:per\s*lb|\/lb|lb)\b/.test(t) && !/\d+\s*lb(?:s)?\b/.test(t)) {
    return { qty: 1, unit: "kg" };
  }

  // Quantity must be read before the generic "dozen" marker (2 dozen is not 1).
  const dozenMatch = t.match(/(\d+(?:\.\d+)?)\s*dozen\b/);
  if (dozenMatch) return { qty: Number(dozenMatch[1]), unit: "dozen" };
  if (/(?:^|\s)12\s*eggs\b/.test(t) || /\bdozen\b/.test(t)) {
    return { qty: 1, unit: "dozen" };
  }

  // Pack / count / each
  const multiCountMatch = t.match(/(\d+)\s*x\s*1\b/);
  if (multiCountMatch) {
    return { qty: Number(multiCountMatch[1]), unit: "each" };
  }
  const packMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:per pack|pack|pk|ct|count|each|ea|pc|pieces|un|rolls)\b/);
  if (packMatch) {
    return { qty: Number(packMatch[1]), unit: "each" };
  }
  if (/\b(?:each|ea|\/ea|\/each)\b/.test(t) && !/\d+\s*(?:per pack|pack|pk|ct|count|each|ea|pc|pieces|un|rolls)\b/.test(t)) {
    return { qty: 1, unit: "each" };
  }

  // Kilograms
  const kgMatch = t.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  if (kgMatch) {
    return { qty: Number(kgMatch[1]), unit: "kg" };
  }

  // Grams
  const gMatch = t.match(/(\d+(?:\.\d+)?)\s*g(?:rams?)?\b/);
  if (gMatch) {
    const g = Number(gMatch[1]);
    return { qty: Math.round((g / 1000) * 10000) / 10000, unit: "kg" };
  }

  // Pounds (lb)
  const lbMatch = t.match(/(\d+(?:\.\d+)?)\s*lb(?:s)?(?:\s*bag)?\b/);
  if (lbMatch) {
    const lbs = Number(lbMatch[1]);
    let kg: number;
    if (lbs === 3) kg = 1.36;
    else if (lbs === 10) kg = 4.54;
    else if (lbs === 2) kg = 0.907;
    else if (lbs === 1) kg = 0.454;
    else kg = Math.round(lbs * 0.45359237 * 100) / 100;
    return { qty: kg, unit: "kg" };
  }

  // Milliliters
  const mlMatch = t.match(/(\d+(?:\.\d+)?)\s*ml\b/);
  if (mlMatch) {
    const ml = Number(mlMatch[1]);
    return { qty: Math.round((ml / 1000) * 10000) / 10000, unit: "L" };
  }

  // Liters
  const lMatch = t.match(/(\d+(?:\.\d+)?)\s*l\b/);
  if (lMatch) {
    return { qty: Number(lMatch[1]), unit: "L" };
  }

  return null;
}

/**
 * Parses multi-buy deals like "2 for $5", "2/$5.00", "Buy 2 for $5", "2 @ $5".
 */
export function parseMultiBuy(text: string): MultiBuy | null {
  if (!text) return null;
  const t = text.replace(",", ".");
  const m = t.match(/(?:buy\s+)?(\d+)\s*(?:for|\/|@)\s*\$?\s*(\d+(?:\.\d{1,2})?)/i);
  if (!m) return null;
  const qty = Number(m[1]);
  const total = Number(m[2]);
  if (qty >= 2 && total > 0) {
    return { qty, total };
  }
  return null;
}

/**
 * Parses price and unit qualifier (if present).
 * Examples:
 * "$5.99" -> { price: 5.99 }
 * "$1.29/lb" -> { price: 1.29, per: "lb" }
 * "$2.84/kg" -> { price: 2.84, per: "kg" }
 * "$0.99/100g" -> { price: 0.99, per: "100g" }
 * "$1.49 ea" -> { price: 1.49, per: "each" }
 */
export function parsePrice(text: string): { price: number; per?: "kg" | "lb" | "100g" | "each" } | null {
  if (!text) return null;
  const t = text.replace(",", ".");

  // Look for a price number
  const priceMatch = t.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (!priceMatch) return null;

  const price = Number(priceMatch[1]);
  if (isNaN(price)) return null;

  // Check for unit qualifier
  let per: "kg" | "lb" | "100g" | "each" | undefined;
  if (/(?:\/|\bper\s*)100\s*g\b/i.test(t)) {
    per = "100g";
  } else if (/(?:\/|\bper\s*)kg\b/i.test(t)) {
    per = "kg";
  } else if (/(?:\/|\bper\s*)lb(?:s)?\b/i.test(t)) {
    per = "lb";
  } else if (/(?:\/|\bper\s*|\s+)(?:ea|each)\b/i.test(t)) {
    per = "each";
  }

  return per ? { price, per } : { price };
}
