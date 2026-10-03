// STUB (SPEC-00). BE-01 replaces; keep signatures.
import type { MultiBuy, Unit } from "../shared/types";

/** "454 g" -> { qty: 0.454, unit: "kg" }; "4 L"; "500 mL"; "12 pack" -> each; "dozen"; "per kg"; "/lb" -> kg */
export function parseSize(text: string): { qty: number; unit: Unit } | null {
  void text;
  return null;
}
/** "2 for $5", "2/$5.00", "Buy 2 for $5" -> { qty: 2, total: 5 } */
export function parseMultiBuy(text: string): MultiBuy | null {
  void text;
  return null;
}
/** "$5.99" -> { price: 5.99 }; "$1.29/lb" -> { price: 1.29, per: "lb" } */
export function parsePrice(text: string): { price: number; per?: "kg" | "lb" | "100g" | "each" } | null {
  const m = text.replace(",", ".").match(/(\d+(?:\.\d{1,2})?)/);
  return m ? { price: Number(m[1]) } : null;
}
