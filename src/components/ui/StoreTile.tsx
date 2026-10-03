import { CheckCircle } from "@phosphor-icons/react";
import type { Retailer, TileColour } from "@shared/types";
import { cn } from "@/lib/cn";

export interface StoreTileProps { retailer: Retailer; selected?: boolean; onClick?: () => void; size?: "md" | "lg"; className?: string }

export const tileClass: Record<TileColour, string> = {
  tangerine: "bg-tangerine [--lip:var(--color-tangerine-lip)]",
  pink: "bg-pink [--lip:var(--color-pink-lip)]",
  teal: "bg-teal [--lip:var(--color-teal-lip)]",
  violet: "bg-violet [--lip:var(--color-violet-lip)]",
};

// Original shapes, one per tile colour, drawn on a 24px grid in currentColor.
function Glyph({ colour, px }: { colour: TileColour; px: number }) {
  const common = { width: px, height: px, viewBox: "0 0 24 24", "aria-hidden": true as const, className: "block" };
  switch (colour) {
    case "tangerine":
      // rounded five-point star: a polygon whose stroke rounds the points
      return (
        <svg {...common}>
          <polygon points="12,3.5 14.6,9.4 20.9,10 16.1,14.2 17.6,20.4 12,17.1 6.4,20.4 7.9,14.2 3.1,10 9.4,9.4" fill="currentColor" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
    case "pink":
      // half circle
      return (
        <svg {...common}>
          <path d="M2 17a10 10 0 0 1 20 0z" fill="currentColor" />
        </svg>
      );
    case "teal":
      // hexagon
      return (
        <svg {...common}>
          <polygon points="12,2.5 20.2,7.25 20.2,16.75 12,21.5 3.8,16.75 3.8,7.25" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "violet":
      // squircle
      return (
        <svg {...common}>
          <path d="M12 2.5c7.6 0 9.5 1.9 9.5 9.5s-1.9 9.5-9.5 9.5S2.5 19.6 2.5 12 4.4 2.5 12 2.5z" fill="currentColor" />
        </svg>
      );
  }
}

export function StoreTile({ retailer, selected = false, onClick, size = "lg", className }: StoreTileProps) {
  const lg = size === "lg";
  const px = lg ? 28 : 22;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "press relative flex items-end rounded-md p-4 text-left font-display font-semibold leading-tight text-white",
        tileClass[retailer.tile],
        lg
          ? "min-h-24 text-[22px] shadow-[0_6px_0_var(--lip)] active:shadow-[0_0_0_var(--lip)] active:[transform:translateY(6px)]"
          : "min-h-[72px] text-[18px] shadow-[0_4px_0_var(--lip)] active:shadow-[0_0_0_var(--lip)]",
        selected && "ring-4 ring-inset ring-white",
        className,
      )}
    >
      <span className="absolute right-3 top-3" aria-hidden="true">
        {selected ? <CheckCircle size={px} weight="fill" color="white" /> : <span className="block text-white opacity-30"><Glyph colour={retailer.tile} px={px} /></span>}
      </span>
      {retailer.shortName}
    </button>
  );
}
