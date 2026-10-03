// STUB (SPEC-00). SCR-04 replaces; props are final.
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import type { Item } from "@shared/types";
import { ItemArt } from "@/components/art";
import { cn } from "@/lib/cn";

export interface ItemRowProps { item: Item; right?: ReactNode; onClick?: () => void; className?: string }

export function ItemRow({ item, right, onClick, className }: ItemRowProps) {
  return (
    <button type="button" onClick={onClick} className={cn("lifted flex min-h-16 w-full items-center gap-3 rounded-md bg-canvas p-3 text-left", className)}>
      <ItemArt artKey={item.artKey} size={48} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-h3 font-extrabold">{item.name}</span>
        <span className="block text-small text-ink-soft">{item.sizeLabel}</span>
      </span>
      {right}
      {onClick && <CaretRight size={20} weight="bold" className="text-ink-soft" />}
    </button>
  );
}
