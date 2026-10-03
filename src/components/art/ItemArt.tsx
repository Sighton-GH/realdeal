// STUB (SPEC-00). ART-03/ART-04 replace with illustrations; props are final.
import { Basket } from "@phosphor-icons/react";
import type { ArtKey } from "@shared/types";
import { cn } from "@/lib/cn";

export interface ItemArtProps { artKey: ArtKey; size?: number; className?: string }

export function ItemArt({ artKey, size = 64, className }: ItemArtProps) {
  return (
    <span role="img" aria-label={artKey} style={{ width: size, height: size }} className={cn("inline-flex shrink-0 items-center justify-center rounded-md bg-sunken text-ink-soft", className)}>
      <Basket size={size * 0.5} weight="bold" />
    </span>
  );
}
