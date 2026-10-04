import type { Item, TagAmount, TagUnit, Unit } from "./types";

export const LB_KG = 0.45359237;
const OZ_KG = 0.028349523125;

/** How many item units one tag unit is. Key order is the order compatibleUnits returns. */
const FACTORS: Record<Unit, Partial<Record<TagUnit, number>>> = {
  kg: { g: 0.001, kg: 1, lb: LB_KG, oz: OZ_KG },
  L: { mL: 0.001, L: 1 },
  each: { each: 1, dozen: 12 },
  dozen: { dozen: 1, each: 1 / 12 },
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The tag amount in the item's unit (1 lb -> 0.4536 kg), or undefined when the units don't convert. */
export function toItemUnits(a: TagAmount, itemUnit: Unit): number | undefined {
  const f = FACTORS[itemUnit][a.unit];
  if (f === undefined || !(a.qty > 0)) return undefined;
  return a.qty * f;
}

export function compatibleUnits(itemUnit: Unit): TagUnit[] {
  return Object.keys(FACTORS[itemUnit]) as TagUnit[];
}

/** The catalogue size written the way a tag would print it: 0.454 kg -> 454 g. */
export function fromItemUnits(qty: number, itemUnit: Unit): TagAmount {
  switch (itemUnit) {
    case "kg": return qty < 1 ? { qty: Math.round(qty * 1000), unit: "g" } : { qty: round2(qty), unit: "kg" };
    case "L": return qty < 1 ? { qty: Math.round(qty * 1000), unit: "mL" } : { qty: round2(qty), unit: "L" };
    case "each": return { qty: round2(qty), unit: "each" };
    case "dozen": return { qty: round2(qty), unit: "dozen" };
  }
}

/** "per lb", "each", "for 454 g", "for 12 pack". */
export function formatTagAmount(a: TagAmount): string {
  if (a.qty === 1) return a.unit === "each" ? "each" : `per ${a.unit}`;
  return `for ${round2(a.qty)} ${a.unit === "each" ? "pack" : a.unit}`;
}

const UNIT_WORDS: Array<[RegExp, TagUnit]> = [
  [/^(?:kg|kgs|kilos?|kilograms?)$/, "kg"],
  [/^(?:g|gr|grams?)$/, "g"],
  [/^(?:lb|lbs|pounds?)$/, "lb"],
  [/^(?:oz|ounces?)$/, "oz"],
  [/^(?:ml|millilit(?:re|er)s?)$/, "mL"],
  [/^(?:l|lit(?:re|er)s?)$/, "L"],
  [/^(?:ea|each|pk|pack|ct|count|pcs?)$/, "each"],
  [/^(?:dozen|doz)$/, "dozen"],
];

function unitOf(word: string): TagUnit | undefined {
  return UNIT_WORDS.find(([re]) => re.test(word))?.[1];
}

/** Reads the first amount in tag text. Money ("$2.81") is removed first so a price is never read as a quantity. */
export function parseTagAmount(text: string | null | undefined): TagAmount | undefined {
  if (!text) return undefined;
  const t = text.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").replace(/\$\s*\d+(?:\.\d+)?/g, " ");

  const multi = t.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([a-z]+)/);
  if (multi) {
    const unit = unitOf(multi[3]);
    if (unit) return { qty: round2(Number(multi[1]) * Number(multi[2])), unit };
  }

  for (const m of t.matchAll(/(\d+(?:\.\d+)?)?\s*([a-z]+)/g)) {
    const unit = unitOf(m[2]);
    if (unit) return { qty: m[1] ? Number(m[1]) : 1, unit };
  }
  return undefined;
}

/** The tag amount when it fits the item, else the item's catalogue size. */
export function amountForItem(a: TagAmount | undefined, item: Item): { amount: TagAmount; fromTag: boolean } {
  if (a && toItemUnits(a, item.unit) !== undefined) return { amount: a, fromTag: true };
  return { amount: fromItemUnits(item.sizeQty, item.unit), fromTag: false };
}

/** True when both amounts are within `tolerance` of each other in the item's unit. */
export function sameAmount(a: TagAmount, b: TagAmount, itemUnit: Unit, tolerance = 0.03): boolean {
  const x = toItemUnits(a, itemUnit);
  const y = toItemUnits(b, itemUnit);
  if (x === undefined || y === undefined) return false;
  return Math.abs(x - y) / Math.max(x, y) <= tolerance;
}
