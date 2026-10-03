import type { ArtKey } from "@shared/types";
import { cn } from "@/lib/cn";
import { DAIRY_BAKERY_ART } from "./items/dairyBakery";
import { PANTRY_PRODUCE_ART } from "./items/pantryProduce";
import type { ArtDrawing } from "./items/types";

export interface ItemArtProps {
  artKey: ArtKey;
  size?: number;
  className?: string;
}

const READABLE_NAMES: Record<ArtKey, string> = {
  milk: "Milk",
  eggs: "Eggs",
  butter: "Butter",
  cheese: "Cheese",
  yogurt: "Yogurt",
  sourcream: "Sour cream",
  flour: "Flour",
  bread: "Bread",
  bagel: "Bagel",
  sugar: "Sugar",
  oats: "Oats",
  pasta: "Pasta",
  rice: "Rice",
  oil: "Cooking oil",
  jar: "Jar",
  can: "Can",
  carton: "Broth carton",
  banana: "Banana",
  apple: "Apple",
  carrot: "Carrot",
  potato: "Potato",
  onion: "Onion",
  tomato: "Tomato",
  lettuce: "Lettuce",
  berries: "Berries",
  broccoli: "Broccoli",
  cucumber: "Cucumber",
  avocado: "Avocado",
  generic: "Grocery item",
};

const FALLBACKS: Partial<Record<ArtKey, ArtKey>> = {
  sourcream: "yogurt",
  bagel: "bread",
  sugar: "flour",
  oats: "flour",
  oil: "jar",
  carton: "milk",
  tomato: "apple",
  potato: "generic",
  onion: "generic",
  lettuce: "generic",
  broccoli: "generic",
  cucumber: "generic",
  avocado: "generic",
};

/** Simple built-in basket used only if both key and generic drawings are unavailable */
const BuiltInBasket: ArtDrawing = () => (
  <g id="art-builtin-basket">
    <path
      d="M 22 28 C 22 18 26 16 32 16 C 38 16 42 18 42 28"
      fill="none"
      stroke="#5E5670"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect x="14" y="27" width="36" height="5" rx="2.5" fill="#5E5670" />
    <rect x="18" y="32" width="28" height="18" rx="3" fill="#D6CFE3" />
  </g>
);

function getDrawing(artKey: ArtKey): ArtDrawing {
  // 1. Direct key match in either set
  const direct = DAIRY_BAKERY_ART[artKey] ?? PANTRY_PRODUCE_ART[artKey];
  if (direct) return direct;

  // 2. Fallback map
  const fallbackKey = FALLBACKS[artKey];
  if (fallbackKey) {
    const fallbackDrawing = DAIRY_BAKERY_ART[fallbackKey] ?? PANTRY_PRODUCE_ART[fallbackKey];
    if (fallbackDrawing) return fallbackDrawing;
  }

  // 3. Generic key fallback
  const genericDrawing = DAIRY_BAKERY_ART.generic ?? PANTRY_PRODUCE_ART.generic;
  if (genericDrawing) return genericDrawing;

  // 4. Built-in basket as final safety net
  return BuiltInBasket;
}

export function ItemArt({ artKey, size = 64, className }: ItemArtProps) {
  const Drawing = getDrawing(artKey);
  const label = READABLE_NAMES[artKey] ?? artKey;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="16" fill="#F6F4FA" />
      <Drawing />
    </svg>
  );
}