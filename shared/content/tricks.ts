// PLACEHOLDER (SPEC-00). SCR-16 replaces with the final copy; keep the export.
import type { TrickInfo } from "../types";

export const TRICKS: TrickInfo[] = [
  { type: "perpetual_sale", name: "Forever sale", oneLiner: "If it's on sale most weeks, the sale price is just the price.", howItWorks: "", howWeCatch: "", exampleItemId: "butter-salted-454g", exampleRetailerId: "saveon" },
  { type: "inflated_was_price", name: "Inflated \"was\" price", oneLiner: "A struck-out price nobody actually paid.", howItWorks: "", howWeCatch: "", exampleItemId: "butter-salted-454g", exampleRetailerId: "saveon" },
  { type: "multibuy_trap", name: "Multi-buy trap", oneLiner: "Buy two, save almost nothing.", howItWorks: "", howWeCatch: "", exampleItemId: "spaghetti-900g", exampleRetailerId: "tnt" },
  { type: "shrinkflation", name: "Shrinkflation", oneLiner: "Same price, less food.", howItWorks: "", howWeCatch: "", exampleItemId: "greek-yogurt-plain", exampleRetailerId: "walmart" },
];
