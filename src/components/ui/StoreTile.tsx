// STUB (SPEC-00). UI-06 replaces; props are final.
import type { Retailer, TileColour } from "@shared/types";
import { cn } from "@/lib/cn";

export interface StoreTileProps { retailer: Retailer; selected?: boolean; onClick?: () => void; size?: "md" | "lg"; className?: string }

export const tileClass: Record<TileColour, string> = {
  tangerine: "bg-tangerine [--lip:var(--color-tangerine-lip)]",
  pink: "bg-pink [--lip:var(--color-pink-lip)]",
  teal: "bg-teal [--lip:var(--color-teal-lip)]",
  violet: "bg-violet [--lip:var(--color-violet-lip)]",
};

export function StoreTile({ retailer, selected, onClick, size = "lg", className }: StoreTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn("press flex items-end rounded-md p-4 text-left font-display font-semibold text-white", tileClass[retailer.tile], size === "lg" ? "min-h-24 text-[22px]" : "min-h-18 text-[18px]", selected && "ring-4 ring-inset ring-white", className)}
    >
      {retailer.shortName}
    </button>
  );
}
