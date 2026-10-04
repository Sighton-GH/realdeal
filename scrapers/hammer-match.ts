import type { Item, Unit } from "../shared/types";
import { matchProduct, type MatchResult } from "./match";
import { parseSize } from "./parse";
import type { RawProduct } from "./types";

type Size = { qty: number; unit: Unit };

function sizeFrom(text: string, item: Item): Size | null {
  const eggCount = item.unit === "dozen" ? text.match(/\b(\d+)\s*(?:eggs?|pack|pk|ct|count|ea|each|pc|pieces)\b/i) : null;
  if (eggCount) return { qty: Number(eggCount[1]) / 12, unit: "dozen" };
  const weightedPack = item.unit === "each" ? text.match(/\b(\d+)\s*[x×]\s*\d+(?:\.\d+)?\s*g\b/i) : null;
  if (weightedPack) return { qty: Number(weightedPack[1]), unit: "each" };
  const count = item.unit === "each" ? text.match(/\b(\d+)\s*(?:per pack|pack|pk|ct|count|each|ea|pc|pieces|un)\b/i) : null;
  if (count) return { qty: Number(count[1]), unit: "each" };
  const size = parseSize(text);
  if (size && item.unit === "dozen" && size.unit === "each") return { qty: size.qty / 12, unit: "dozen" };
  return size;
}

/** Hammer has no stable variant key in our catalogue. Unknown or conflicting sizes must not become prices. */
export function matchHammerProduct(items: Item[], product: RawProduct): MatchResult | null {
  // A token prefilter avoids 140 full match passes for every unrelated Hammer row.
  const productText = `${product.title} ${product.brand ?? ""}`.toLowerCase();
  let best: MatchResult | null = null;
  let ambiguous = false;
  for (const item of items) {
    if (![item.name, ...item.aliases].some((name) => name.toLowerCase().split(/\s+/).some((word) => word.length >= 3 && productText.includes(word)))) continue;
    if (item.category === "meat" || item.category === "seafood") {
      const variants = ["extra lean", "medium", "pork", "veal", "breaded", "cooked", "seasoned", "marinated", "sauce", "burger", "meatball"];
      if (variants.some((v) => productText.includes(v) && !item.name.toLowerCase().includes(v))) continue;
    }
    const titleSize = sizeFrom(product.title, item);
    const fieldSize = sizeFrom(product.sizeText ?? "", item);
    // Hammer often uses "1 ea" for a packaged product whose actual size is in its title.
    const sizes = [titleSize, fieldSize].filter((s): s is Size => s !== null)
      .filter((s) => !(titleSize && s === fieldSize && s.unit === "each" && s.qty === 1 && item.unit !== "each"));
    if (!sizes.length) continue;
    const perWeight = item.sizeLabel === "per kg";
    const text = `${product.title} ${product.sizeText ?? ""}`;
    if (perWeight && !/(?:\bper\s*|\/)\s*(?:kg|lbs?)\b/i.test(text)) continue;
    if (!perWeight && /(?:\bper\s*|\/)\s*(?:kg|lbs?)\b/i.test(text)) continue;
    if (!sizes.every((s) => s.unit === item.unit && Math.abs(s.qty - item.sizeQty) <= item.sizeQty * 0.01)) continue;
    const sizeText = `${sizes[0].qty} ${sizes[0].unit}`;
    const result = matchProduct(item, [{ ...product, sizeText }]);
    if (!result) continue;
    if (!best || result.score > best.score) { best = result; ambiguous = false; }
    else if (result.score === best.score && result.item.id !== best.item.id) ambiguous = true;
  }
  return ambiguous ? null : best;
}
