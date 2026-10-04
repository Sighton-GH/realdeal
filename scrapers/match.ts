import type { Item } from "../shared/types";
import { parsePrice, parseSize } from "./parse";
import type { RawProduct } from "./types";

export interface MatchResult {
  item: Item;
  product: RawProduct;
  score: number;
  reason: string;
}

const FILLER_WORDS = new Set([
  "the", "a", "an", "and", "or", "in", "of", "with", "by", "for", "to", "at", "from",
  "fresh", "pure", "natural", "premium", "quality", "classic", "original",
]);

/**
 * Normalises a string: lowercase, punctuation removed, filler words removed, simple plurals singularised.
 * Note: "organic" is explicitly NOT dropped.
 */
export function normalise(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/\ballpurpose\b/g, "all purpose")
    .replace(/\bpartly\s+skimmed\b/g, "2% milk")
    .replace(/\bchick\s+peas?\b/g, "chickpeas")
    .replace(/\belbows?\b/g, "macaroni")
    .replace(/[^\w\s%]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words
    .filter((w) => !FILLER_WORDS.has(w))
    .map(singularise);
}

function singularise(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("berries")) return word.slice(0, -7) + "berry";
  if (word.endsWith("tomatoes")) return "tomato";
  if (word.endsWith("potatoes")) return "potato";
  if (word.endsWith("avocados")) return "avocado";
  if (word.endsWith("bananas")) return "banana";
  if (word.endsWith("apples")) return "apple";
  if (word.endsWith("onions")) return "onion";
  if (word.endsWith("carrots")) return "carrot";
  if (word.endsWith("eggs")) return "egg";
  if (word.endsWith("bagels")) return "bagel";
  if (word.endsWith("beans")) return "bean";
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us") && word !== "oats") {
    return word.slice(0, -1);
  }
  return word;
}

// Conflicting keywords per specific item or item category
interface ConflictRule {
  itemFilter: (item: Item) => boolean;
  rejectWords: string[];
}

const CONFLICT_RULES: ConflictRule[] = [
  // Salted butter cannot match unsalted or margarine
  {
    itemFilter: (item) => item.id.includes("butter-salted") || (/\bsalted\b/i.test(item.name) && item.name.toLowerCase().includes("butter")),
    rejectWords: ["unsalted", "sweet", "margarine", "peanut", "vegan"],
  },
  // Butter cannot match peanut butter
  {
    itemFilter: (item) => item.category === "dairy" && item.artKey === "butter",
    rejectWords: ["peanut", "almond", "apple", "cookie"],
  },
  // Peanut butter cannot match dairy butter without peanut
  {
    itemFilter: (item) => item.id.includes("peanut-butter"),
    rejectWords: [],
  },
  // 2% milk cannot match chocolate, flavoured, or other milk fat percentages
  {
    itemFilter: (item) => item.id.includes("milk-2pct"),
    rejectWords: ["chocolate", "strawberry", "vanilla", "homo", "homogenized", "whole", "1%", "3.25%", "almond", "oat", "soy"],
  },
  // Homo milk cannot match 2%, 1%, skim, or chocolate
  {
    itemFilter: (item) => item.id.includes("milk-homo"),
    rejectWords: ["chocolate", "strawberry", "vanilla", "2%", "1%", "skim", "almond", "oat", "soy"],
  },
  // All purpose flour cannot match whole wheat, cake, or bread flour
  {
    itemFilter: (item) => item.id.includes("flour-ap"),
    rejectWords: ["whole", "wheat", "wholewheat", "cake", "bread", "almond", "coconut"],
  },
  // Whole wheat flour cannot match all purpose or white
  {
    itemFilter: (item) => item.id.includes("flour-ww"),
    rejectWords: ["white"],
  },
  // White bread cannot match whole wheat
  {
    itemFilter: (item) => item.id.includes("bread-white"),
    rejectWords: ["whole", "wheat", "wholewheat", "rye", "multigrain"],
  },
  // Whole wheat bread cannot match white
  {
    itemFilter: (item) => item.id.includes("bread-ww"),
    rejectWords: ["white"],
  },
  // Spaghetti cannot match other pasta cuts
  {
    itemFilter: (item) => item.id.includes("spaghetti"),
    rejectWords: ["penne", "macaroni", "rotini", "fusilli", "linguine", "fettuccine", "rigatoni"],
  },
  // Penne cannot match other pasta cuts
  {
    itemFilter: (item) => item.id.includes("penne"),
    rejectWords: ["spaghetti", "macaroni", "rotini", "fusilli", "linguine", "fettuccine", "rigatoni"],
  },
  // Long grain rice cannot match jasmine or basmati
  {
    itemFilter: (item) => item.id.includes("rice-long"),
    rejectWords: ["jasmine", "basmati", "brown", "calrose"],
  },
  // Jasmine rice cannot match long grain or basmati
  {
    itemFilter: (item) => item.id.includes("rice-jasmine"),
    rejectWords: ["basmati", "brown"],
  },
  // Plain greek yogurt cannot match vanilla or strawberry
  {
    itemFilter: (item) => item.id.includes("greek-yogurt-plain"),
    rejectWords: ["vanilla", "strawberry", "blueberry", "raspberry"],
  },
  // Vanilla yogurt cannot match plain or greek
  {
    itemFilter: (item) => item.id.includes("yogurt-vanilla"),
    rejectWords: ["plain"],
  },
];

/**
 * Words that mark a different product variant ("brown sugar", "olive oil", "kidney beans").
 * A product containing one of these is rejected unless the item's own name or aliases use the word.
 */
const VARIANT_WORDS = new Set([
  // sugar, oil, broth, beans, canned tomatoes, sauce
  "brown", "icing", "powdered", "cane", "demerara", "olive", "sunflower", "avocado", "coconut", "sesame", "peanut",
  "beef", "vegetable", "turkey", "mushroom", "kidney", "chickpea", "pinto", "navy", "baked", "crushed", "paste", "stewed", "whole", "alfredo", "pizza",
  // pasta, rice, flour
  "farfalle", "rotini", "fusilli", "macaroni", "elbow", "shell", "linguine", "fettuccine", "rigatoni", "lasagna",
  "sushi", "arborio", "wild", "sticky", "glutinous", "basmati", "rice", "rye", "almond", "buckwheat", "spelt", "tapioca", "gluten", "self", "pastry", "cake",
  // dairy, eggs, bread
  "mild", "medium", "marble", "strawberry", "blueberry", "lactose", "skim", "chocolate", "whipped", "cashew", "jumbo", "extra", "small", "liquid",
  // bakery, produce
  "instant", "steel", "quick", "everything", "cinnamon", "sesame", "blueberry", "mini", "granny", "smith", "fuji", "honeycrisp", "mcintosh", "ambrosia", "cherry", "grape", "red", "sweet", "yellow",
]);

/** Items whose aliases are generic ("rice", "yogurt"): the product must also contain one of these words. */
const REQUIRED_ANY: Array<{ itemId: string; anyOf: string[] }> = [
  { itemId: "rice-jasmine-8kg", anyOf: ["jasmine"] },
  { itemId: "rice-long-8kg", anyOf: ["long", "white"] },
  { itemId: "tomatoes-roma-kg", anyOf: ["roma", "plum"] },
  { itemId: "greek-yogurt-plain", anyOf: ["greek"] },
  { itemId: "yogurt-vanilla-650g", anyOf: ["vanilla"] },
  { itemId: "spaghetti-900g", anyOf: ["spaghetti"] },
  { itemId: "penne-900g", anyOf: ["penne"] },
];

const vocabCache = new WeakMap<Item, Set<string>>();
function itemVocabulary(item: Item): Set<string> {
  let v = vocabCache.get(item);
  if (!v) {
    v = new Set([item.name, ...item.aliases].flatMap((n) => normalise(n)));
    vocabCache.set(item, v);
  }
  return v;
}

/**
 * Best matching product for an item, or null. `previousSizes` lets shrunk packages still match.
 */
export function matchProduct(
  item: Item,
  products: RawProduct[],
  previousSizes: number[] = [],
): MatchResult | null {
  if (!products || products.length === 0) return null;

  let bestResult: MatchResult | null = null;
  let bestScore = -Infinity;

  for (const product of products) {
    const res = scoreProductMatch(item, product, previousSizes);
    if (res && res.score > bestScore) {
      bestScore = res.score;
      bestResult = res;
    }
  }

  // Threshold: only return results with acceptable positive score
  if (bestResult && bestResult.score >= 0.5) {
    return bestResult;
  }

  return null;
}

function scoreProductMatch(
  item: Item,
  product: RawProduct,
  previousSizes: number[],
): MatchResult | null {
  const fullProductText = [product.title, product.brand, product.sizeText].filter(Boolean).join(" ");
  const productTokens = normalise(fullProductText);
  const productTokenSet = new Set(productTokens);

  // Do not compare basic groceries with prepared foods carrying their names.
  const itemText = [item.name, ...item.aliases].join(" ").toLowerCase();
  if (/\b(?:pies?|tarts?|popcorn|cakes?|cookies?|juices?|sauces?|ice cream|ice milk|puddings?)\b/i.test(fullProductText)
      && !/\b(?:pies?|tarts?|popcorn|cakes?|cookies?|juices?|sauces?|ice cream|ice milk|puddings?)\b/i.test(itemText)) return null;
  if (item.id.includes("milk-2pct") && /\bskim(?:med)?\b/i.test(fullProductText)
      && !/partly\s+skimmed/i.test(fullProductText)) return null;
  if (item.id.includes("milk-skim") && /partly\s+skimmed/i.test(fullProductText)) return null;

  if (item.id.includes("milk-skim") && !/\bskim(?:med)?\b|\b0%/i.test(fullProductText)) return null;
  if (item.id.includes("milk-2pct") && !/2\s*%|partly\s+skimmed/i.test(fullProductText)) return null;

  // Check hard conflicts
  for (const rule of CONFLICT_RULES) {
    if (rule.itemFilter(item)) {
      for (const rw of rule.rejectWords) {
        if (productTokenSet.has(rw) || fullProductText.toLowerCase().includes(rw)) {
          return null;
        }
      }
    }
  }

  // Different variant of the same staple (brown sugar, olive oil, ...)
  const vocab = itemVocabulary(item);
  for (const t of productTokenSet) {
    if (VARIANT_WORDS.has(t) && !vocab.has(t)
        && !(t === "red" && item.id.includes("kidney"))
        && !(t === "medium" && item.id.includes("coffee"))
        && !(t === "whole" && item.id.includes("oats"))
        && !(t === "brown" && item.artKey === "eggs")
        && !(t === "extra" && (item.id.includes("pineapple") || item.id.includes("peppers")))
        && !(t === "skimmed" && item.id.includes("milk-2pct") && /partly\s+skimmed/i.test(fullProductText))) return null;
  }
  const required = REQUIRED_ANY.find((r) => r.itemId === item.id);
  if (required && !required.anyOf.some((w) => productTokenSet.has(w))) return null;

  // Parse size from product sizeText or title
  const parsedProdSize = parseSize(product.sizeText || "") || parseSize(product.title);

  // Check per-weight produce (bananas, apples, etc. priced per lb)
  const isPerKgProduce = item.unit === "kg" && (item.sizeLabel === "per kg" || item.sizeQty === 1 && item.category === "produce");
  let normalisedPrice: number | undefined;

  const parsedPrice = parsePrice(product.unitPriceText || product.sizeText || "");
  const isPricedPerLb = parsedPrice?.per === "lb" || /\/(?:lb)\b/i.test(product.unitPriceText || "") || /\bper\s*lb\b/i.test(product.unitPriceText || "") || /\bper\s*lb\b/i.test(product.sizeText || "");

  if (isPerKgProduce && isPricedPerLb) {
    normalisedPrice = Math.round((product.price / 0.45359237) * 100) / 100;
  }

  // Size validation
  if (parsedProdSize) {
    let sizeMatches = false;

    // Normalise egg dozen / count
    let prodQty = parsedProdSize.qty;
    let prodUnit = parsedProdSize.unit;
    if (item.unit === "dozen" && prodUnit === "each" && (prodQty === 12 || prodQty === 1)) {
      prodQty = 1;
      prodUnit = "dozen";
    }

    if (isPerKgProduce && isPricedPerLb) {
      sizeMatches = true;
    } else if (prodUnit === item.unit) {
      const allowedSizes = [item.sizeQty, ...previousSizes];
      sizeMatches = allowedSizes.some((s) => Math.abs(prodQty - s) / s <= 0.15);
    }

    if (!sizeMatches) {
      return null;
    }
  }

  // Token matching: item name and aliases
  const itemNames = [item.name, ...item.aliases];
  let maxTokenOverlap = 0;
  let bestItemTokensCount = 1;
  let bestMatched = 0;

  for (const nameVariant of itemNames) {
    const itemTokens = normalise(nameVariant);
    if (itemTokens.length === 0) continue;
    let overlap = 0;
    for (const t of itemTokens) {
      if (productTokenSet.has(t)) {
        overlap++;
      }
    }
    const ratio = overlap / itemTokens.length;
    if (ratio > maxTokenOverlap || (ratio === maxTokenOverlap && overlap > bestMatched)) {
      maxTokenOverlap = ratio;
      bestItemTokensCount = itemTokens.length;
      bestMatched = overlap;
    }
  }

  // Every word of the item's name (or of one alias) must appear: "olive oil" is not "canola oil"
  if (maxTokenOverlap < 0.99) {
    return null;
  }

  // Compute final score: full coverage, plus a small bonus for more specific (longer) matches
  let score = maxTokenOverlap + 0.02 * bestMatched;

  // Bonus for category / artKey match
  if (productTokenSet.has(item.category) || productTokenSet.has(item.artKey)) {
    score += 0.15;
  }

  // Build reason string
  let reason = `tokens ${Math.round(maxTokenOverlap * bestItemTokensCount)}/${bestItemTokensCount}`;
  if (parsedProdSize) {
    reason += `, size ${product.sizeText || parsedProdSize.qty + parsedProdSize.unit} ok`;
  }
  if (normalisedPrice !== undefined) {
    reason += `, normalisedPrice=$${normalisedPrice.toFixed(2)}/kg`;
  }

  return {
    item,
    product,
    score,
    reason,
  };
}

/**
 * Rank our items against free text (used by the Gemini scan). Best first.
 */
export function rankItems(items: Item[], text: string, sizeText?: string, limit = 3): Item[] {
  if (!items || items.length === 0 || !text) return [];

  const parsedSize = parseSize(sizeText || text);
  const textTokens = normalise(text);
  const textTokenSet = new Set(textTokens);

  const scored = items.map((item) => {
    // Check conflicts
    for (const rule of CONFLICT_RULES) {
      if (rule.itemFilter(item)) {
        for (const rw of rule.rejectWords) {
          if (textTokenSet.has(rw)) {
            return { item, score: -100 };
          }
        }
      }
    }

    // Overlap with name and aliases
    let maxOverlapRatio = 0;
    let bestMatched = 0;
    for (const nameVariant of [item.name, ...item.aliases]) {
      const itemTokens = normalise(nameVariant);
      if (itemTokens.length === 0) continue;
      let overlap = 0;
      for (const t of itemTokens) {
        if (textTokenSet.has(t)) {
          overlap++;
        }
      }
      const ratio = overlap / itemTokens.length;
      if (ratio > maxOverlapRatio || (ratio === maxOverlapRatio && overlap > bestMatched)) {
        maxOverlapRatio = ratio;
        bestMatched = overlap;
      }
    }

    // A longer match is more specific ("roma tomatoes" beats the bare alias "tomatoes")
    let score = maxOverlapRatio > 0 ? maxOverlapRatio + 0.02 * bestMatched : 0;

    // Size tiebreaker
    if (parsedSize) {
      let prodQty = parsedSize.qty;
      let prodUnit = parsedSize.unit;
      if (item.unit === "dozen" && prodUnit === "each" && (prodQty === 12 || prodQty === 1)) {
        prodQty = 1;
        prodUnit = "dozen";
      }

      if (prodUnit === item.unit && Math.abs(prodQty - item.sizeQty) / item.sizeQty <= 0.15) {
        score += 0.3;
      }
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}