import type { Item, Unit } from "@shared/types";

export interface ItemSizeOption {
  label: string;
  sizeQty: number;
  description?: string;
  isDefault?: boolean;
}

/**
 * Standard Canadian grocery package sizes for all items.
 * Every item supports multiple sizes (e.g. 4L and 2L for milk).
 */
export const ITEM_SIZES: Record<string, ItemSizeOption[]> = {
  // --- Dairy ---
  "milk-2pct-4l": [
    { label: "4 L", sizeQty: 4, description: "Family jug", isDefault: true },
    { label: "2 L", sizeQty: 2, description: "Standard carton" },
    { label: "1 L", sizeQty: 1, description: "Small carton" },
  ],
  "milk-homo-2l": [
    { label: "4 L", sizeQty: 4, description: "Family jug" },
    { label: "2 L", sizeQty: 2, description: "Standard carton", isDefault: true },
    { label: "1 L", sizeQty: 1, description: "Small carton" },
  ],
  "butter-salted-454g": [
    { label: "454 g", sizeQty: 0.454, description: "1 lb brick", isDefault: true },
    { label: "250 g", sizeQty: 0.25, description: "Half-pound block" },
    { label: "907 g", sizeQty: 0.907, description: "2 lb twin pack" },
  ],
  "eggs-large-12": [
    { label: "12 pack", sizeQty: 1, description: "Dozen (12)", isDefault: true },
    { label: "18 pack", sizeQty: 1.5, description: "18 eggs (1.5 doz)" },
    { label: "30 pack", sizeQty: 2.5, description: "Flat (30 eggs)" },
    { label: "6 pack", sizeQty: 0.5, description: "Half dozen (6)" },
  ],
  "cheddar-old-400g": [
    { label: "400 g", sizeQty: 0.4, description: "Standard block", isDefault: true },
    { label: "200 g", sizeQty: 0.2, description: "Small block" },
    { label: "700 g", sizeQty: 0.7, description: "Club block" },
  ],
  "mozzarella-340g": [
    { label: "340 g", sizeQty: 0.34, description: "Standard ball/block", isDefault: true },
    { label: "200 g", sizeQty: 0.2, description: "Small block" },
    { label: "600 g", sizeQty: 0.6, description: "Family block" },
  ],
  "greek-yogurt-plain": [
    { label: "500 g", sizeQty: 0.5, description: "Standard tub", isDefault: true },
    { label: "650 g", sizeQty: 0.65, description: "Classic tub" },
    { label: "750 g", sizeQty: 0.75, description: "Large tub" },
    { label: "1 kg", sizeQty: 1, description: "Family tub" },
  ],
  "yogurt-vanilla-650g": [
    { label: "650 g", sizeQty: 0.65, description: "Standard tub", isDefault: true },
    { label: "500 g", sizeQty: 0.5, description: "Small tub" },
    { label: "750 g", sizeQty: 0.75, description: "Family tub" },
  ],
  "sour-cream-500ml": [
    { label: "500 mL", sizeQty: 0.5, description: "Standard tub", isDefault: true },
    { label: "250 mL", sizeQty: 0.25, description: "Small tub" },
    { label: "750 mL", sizeQty: 0.75, description: "Large tub" },
  ],
  "cream-cheese-250g": [
    { label: "250 g", sizeQty: 0.25, description: "Standard brick", isDefault: true },
    { label: "227 g", sizeQty: 0.227, description: "8 oz tub" },
    { label: "400 g", sizeQty: 0.4, description: "Family tub" },
  ],

  // --- Bakery ---
  "flour-ap-10kg": [
    { label: "10 kg", sizeQty: 10, description: "Bulk sack", isDefault: true },
    { label: "5 kg", sizeQty: 5, description: "Medium bag" },
    { label: "2.5 kg", sizeQty: 2.5, description: "Pantry bag" },
    { label: "1 kg", sizeQty: 1, description: "Small bag" },
  ],
  "flour-ap-2-5kg": [
    { label: "2.5 kg", sizeQty: 2.5, description: "Pantry bag", isDefault: true },
    { label: "5 kg", sizeQty: 5, description: "Medium bag" },
    { label: "10 kg", sizeQty: 10, description: "Bulk sack" },
    { label: "1 kg", sizeQty: 1, description: "Small bag" },
  ],
  "flour-ww-2-5kg": [
    { label: "2.5 kg", sizeQty: 2.5, description: "Standard bag", isDefault: true },
    { label: "5 kg", sizeQty: 5, description: "Large bag" },
    { label: "1 kg", sizeQty: 1, description: "Small bag" },
  ],
  "bread-white-675g": [
    { label: "675 g", sizeQty: 0.675, description: "Full loaf", isDefault: true },
    { label: "570 g", sizeQty: 0.57, description: "Standard loaf" },
    { label: "450 g", sizeQty: 0.45, description: "Small loaf" },
  ],
  "bread-ww-675g": [
    { label: "675 g", sizeQty: 0.675, description: "Full loaf", isDefault: true },
    { label: "570 g", sizeQty: 0.57, description: "Standard loaf" },
    { label: "450 g", sizeQty: 0.45, description: "Small loaf" },
  ],
  "sugar-2kg": [
    { label: "2 kg", sizeQty: 2, description: "Standard bag", isDefault: true },
    { label: "1 kg", sizeQty: 1, description: "Small bag" },
    { label: "4 kg", sizeQty: 4, description: "Family sack" },
  ],
  "oats-1kg": [
    { label: "1 kg", sizeQty: 1, description: "Standard bag", isDefault: true },
    { label: "750 g", sizeQty: 0.75, description: "Small bag" },
    { label: "2.25 kg", sizeQty: 2.25, description: "Bulk sack" },
  ],
  "bagels-6": [
    { label: "6 pack", sizeQty: 6, description: "Standard bag (6)", isDefault: true },
    { label: "12 pack", sizeQty: 12, description: "Club pack (12)" },
  ],

  // --- Pantry ---
  "spaghetti-900g": [
    { label: "900 g", sizeQty: 0.9, description: "Family box", isDefault: true },
    { label: "454 g", sizeQty: 0.454, description: "1 lb box" },
    { label: "500 g", sizeQty: 0.5, description: "Standard box" },
  ],
  "penne-900g": [
    { label: "900 g", sizeQty: 0.9, description: "Family box", isDefault: true },
    { label: "454 g", sizeQty: 0.454, description: "1 lb box" },
    { label: "500 g", sizeQty: 0.5, description: "Standard box" },
  ],
  "rice-long-8kg": [
    { label: "8 kg", sizeQty: 8, description: "Large sack", isDefault: true },
    { label: "4 kg", sizeQty: 4, description: "Medium bag" },
    { label: "2 kg", sizeQty: 2, description: "Small bag" },
  ],
  "rice-jasmine-8kg": [
    { label: "8 kg", sizeQty: 8, description: "Large sack", isDefault: true },
    { label: "4 kg", sizeQty: 4, description: "Medium bag" },
    { label: "2 kg", sizeQty: 2, description: "Small bag" },
  ],
  "canola-oil-3l": [
    { label: "3 L", sizeQty: 3, description: "Standard jug", isDefault: true },
    { label: "1 L", sizeQty: 1, description: "Bottle" },
    { label: "5 L", sizeQty: 5, description: "Club jug" },
  ],
  "peanut-butter-1kg": [
    { label: "1 kg", sizeQty: 1, description: "Standard jar", isDefault: true },
    { label: "500 g", sizeQty: 0.5, description: "Small jar" },
    { label: "2 kg", sizeQty: 2, description: "Club tub" },
  ],
  "tomatoes-canned-796ml": [
    { label: "796 mL", sizeQty: 0.796, description: "Large can (28 oz)", isDefault: true },
    { label: "398 mL", sizeQty: 0.398, description: "Standard can (14 oz)" },
  ],
  "black-beans-540ml": [
    { label: "540 mL", sizeQty: 0.54, description: "Standard can (19 oz)", isDefault: true },
    { label: "398 mL", sizeQty: 0.398, description: "Small can (14 oz)" },
  ],
  "pasta-sauce-650ml": [
    { label: "650 mL", sizeQty: 0.65, description: "Standard jar", isDefault: true },
    { label: "375 mL", sizeQty: 0.375, description: "Small jar" },
  ],
  "chicken-broth-900ml": [
    { label: "900 mL", sizeQty: 0.9, description: "Standard carton", isDefault: true },
    { label: "1 L", sizeQty: 1, description: "1 L carton" },
    { label: "500 mL", sizeQty: 0.5, description: "Small carton" },
  ],

  // --- Produce ---
  "bananas-kg": [
    { label: "per kg", sizeQty: 1, description: "1 kg", isDefault: true },
    { label: "per lb", sizeQty: 0.454, description: "1 lb (0.45 kg)" },
    { label: "Bunch", sizeQty: 1.2, description: "Bunch (~1.2 kg)" },
  ],
  "apples-gala-kg": [
    { label: "per kg", sizeQty: 1, description: "1 kg", isDefault: true },
    { label: "per lb", sizeQty: 0.454, description: "1 lb (0.45 kg)" },
    { label: "3 lb bag", sizeQty: 1.36, description: "3 lb bag (1.36 kg)" },
    { label: "5 lb bag", sizeQty: 2.27, description: "5 lb bag (2.27 kg)" },
  ],
  "carrots-907g": [
    { label: "2 lb bag", sizeQty: 0.907, description: "2 lb bag (907 g)", isDefault: true },
    { label: "5 lb bag", sizeQty: 2.27, description: "5 lb bag (2.27 kg)" },
    { label: "1 lb bag", sizeQty: 0.454, description: "1 lb bag (454 g)" },
  ],
  "potatoes-russet-4-54kg": [
    { label: "10 lb bag", sizeQty: 4.54, description: "10 lb bag (4.54 kg)", isDefault: true },
    { label: "5 lb bag", sizeQty: 2.27, description: "5 lb bag (2.27 kg)" },
    { label: "15 lb sack", sizeQty: 6.8, description: "15 lb sack (6.8 kg)" },
  ],
  "onions-yellow-1-36kg": [
    { label: "3 lb bag", sizeQty: 1.36, description: "3 lb bag (1.36 kg)", isDefault: true },
    { label: "5 lb bag", sizeQty: 2.27, description: "5 lb bag (2.27 kg)" },
    { label: "10 lb sack", sizeQty: 4.54, description: "10 lb sack (4.54 kg)" },
  ],
  "tomatoes-roma-kg": [
    { label: "per kg", sizeQty: 1, description: "1 kg", isDefault: true },
    { label: "per lb", sizeQty: 0.454, description: "1 lb (0.45 kg)" },
  ],
  "romaine-3": [
    { label: "3 pack", sizeQty: 3, description: "3 hearts", isDefault: true },
    { label: "6 pack", sizeQty: 6, description: "Club pack (6)" },
    { label: "1 heart", sizeQty: 1, description: "Single heart" },
  ],
  "strawberries-454g": [
    { label: "454 g", sizeQty: 0.454, description: "1 lb clamshell", isDefault: true },
    { label: "907 g", sizeQty: 0.907, description: "2 lb clamshell" },
    { label: "283 g", sizeQty: 0.283, description: "10 oz clamshell" },
  ],
  "blueberries-510g": [
    { label: "510 g", sizeQty: 0.51, description: "18 oz clamshell", isDefault: true },
    { label: "340 g", sizeQty: 0.34, description: "11 oz (pint)" },
    { label: "170 g", sizeQty: 0.17, description: "6 oz (half-pint)" },
  ],
  "broccoli-kg": [
    { label: "per kg", sizeQty: 1, description: "1 kg", isDefault: true },
    { label: "per lb", sizeQty: 0.454, description: "1 lb (0.45 kg)" },
    { label: "1 crown", sizeQty: 0.35, description: "1 crown (~350 g)" },
  ],
  "cucumber-english": [
    { label: "1 each", sizeQty: 1, description: "Single cucumber", isDefault: true },
    { label: "3 pack", sizeQty: 3, description: "3 pack" },
  ],
  "avocados-4": [
    { label: "4 pack", sizeQty: 4, description: "Bag of 4", isDefault: true },
    { label: "5 pack", sizeQty: 5, description: "Bag of 5" },
    { label: "6 pack", sizeQty: 6, description: "Club bag (6)" },
    { label: "1 each", sizeQty: 1, description: "Single avocado" },
  ],
};

function defaultSizesForUnit(unit: Unit, baseSizeQty: number, baseLabel: string): ItemSizeOption[] {
  switch (unit) {
    case "L":
      return [
        { label: "4 L", sizeQty: 4, description: "4 Litres" },
        { label: "2 L", sizeQty: 2, description: "2 Litres" },
        { label: "1 L", sizeQty: 1, description: "1 Litre" },
        { label: "500 mL", sizeQty: 0.5, description: "500 mL" },
      ];
    case "kg":
      if (baseSizeQty >= 5) {
        return [
          { label: "10 kg", sizeQty: 10 },
          { label: "5 kg", sizeQty: 5 },
          { label: "2.5 kg", sizeQty: 2.5 },
          { label: "1 kg", sizeQty: 1 },
        ];
      }
      return [
        { label: baseLabel, sizeQty: baseSizeQty, isDefault: true },
        { label: "1 kg", sizeQty: 1 },
        { label: "500 g", sizeQty: 0.5 },
        { label: "250 g", sizeQty: 0.25 },
      ];
    case "dozen":
      return [
        { label: "12 pack", sizeQty: 1, description: "1 dozen", isDefault: true },
        { label: "18 pack", sizeQty: 1.5, description: "1.5 dozen" },
        { label: "30 pack", sizeQty: 2.5, description: "Flat (30)" },
        { label: "6 pack", sizeQty: 0.5, description: "Half dozen" },
      ];
    case "each":
      return [
        { label: baseLabel, sizeQty: baseSizeQty, isDefault: true },
        { label: "1 each", sizeQty: 1 },
        { label: "3 pack", sizeQty: 3 },
        { label: "6 pack", sizeQty: 6 },
      ];
  }
}

/**
 * Returns all available package size options for an item.
 */
export function getSizesForItem(item: Item): ItemSizeOption[] {
  const specific = ITEM_SIZES[item.id];
  if (specific && specific.length > 0) {
    return specific;
  }
  return defaultSizesForUnit(item.unit, item.sizeQty, item.sizeLabel);
}

/**
 * Returns the default/canonical size for an item.
 */
export function getDefaultSizeForItem(item: Item): ItemSizeOption {
  const sizes = getSizesForItem(item);
  return sizes.find((s) => s.isDefault) ?? sizes[0] ?? {
    label: item.sizeLabel,
    sizeQty: item.sizeQty,
    isDefault: true,
  };
}

/**
 * Returns a brief string summary of available sizes (e.g. "4 L · 2 L · 1 L").
 */
export function formatAvailableSizesSummary(item: Item): string {
  const sizes = getSizesForItem(item);
  return sizes.map((s) => s.label).join(" · ");
}
