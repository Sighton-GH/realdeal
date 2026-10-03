import type { Icon } from "@phosphor-icons/react";
import { Equals, Lightning, ThumbsUp, WarningCircle } from "@phosphor-icons/react";
import type { Verdict, VerdictTier } from "@shared/types";
import { retailerById } from "@shared/retailers";
import type { PennyMood } from "@/components/penny/types";
import { formatMoney } from "./format";

export interface TierMeta {
  label: string;
  shortLabel: string;
  mood: PennyMood;
  bgClass: string;
  tintClass: string;
  textClass: string;
  textOnFaceClass: string;
  borderClass: string;
  lipVar: string;
  icon: Icon;
}

export const tierMeta: Record<VerdictTier, TierMeta> = {
  steal: { label: "Steal!", shortLabel: "Steal", mood: "celebrate", bgClass: "bg-steal", tintClass: "bg-steal-tint", textClass: "text-steal-lip", textOnFaceClass: "text-white", borderClass: "border-steal", lipVar: "var(--color-steal-lip)", icon: Lightning },
  good: { label: "Good deal", shortLabel: "Good", mood: "happy", bgClass: "bg-good", tintClass: "bg-good-tint", textClass: "text-good-lip", textOnFaceClass: "text-white", borderClass: "border-good", lipVar: "var(--color-good-lip)", icon: ThumbsUp },
  normal: { label: "Normal price", shortLabel: "Normal", mood: "meh", bgClass: "bg-normal", tintClass: "bg-normal-tint", textClass: "text-normal-lip", textOnFaceClass: "text-ink", borderClass: "border-normal", lipVar: "var(--color-normal-lip)", icon: Equals },
  high: { label: "Overpriced", shortLabel: "Overpriced", mood: "shocked", bgClass: "bg-high", tintClass: "bg-high-tint", textClass: "text-high-lip", textOnFaceClass: "text-white", borderClass: "border-high", lipVar: "var(--color-high-lip)", icon: WarningCircle },
};

export const TIER_ORDER: VerdictTier[] = ["steal", "good", "normal", "high"];

/** Penny's one-line reaction to a verdict. */
export function pennyLineFor(v: Verdict): string {
  const tricks = v.tricks.map((t) => t.type);
  let line: string;
  switch (v.tier) {
    case "steal":
      line = "Grab it. This is about as cheap as it gets.";
      break;
    case "good":
      line = "Nice find. That's below what it usually costs.";
      break;
    case "normal":
      line = tricks.includes("perpetual_sale")
        ? "That 'sale' is the everyday price. Don't let the tag rush you."
        : "That's just what it usually costs.";
      break;
    case "high":
      line = v.best.retailerId !== v.input.retailerId
        ? `Put it back. ${retailerById(v.best.retailerId).name} has it for ${formatMoney(v.best.price)}.`
        : "Put it back. You can do better.";
      break;
  }
  if ((v.tier === "steal" || v.tier === "good") && tricks.length > 0) line += " Mind the fine print, though.";
  return line;
}
