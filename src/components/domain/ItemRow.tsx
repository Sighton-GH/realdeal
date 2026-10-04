import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import type { Item } from "@shared/types";
import { ItemArt } from "@/components/art";
import { cn } from "@/lib/cn";
import { formatAvailableSizesSummary } from "@/lib/itemSizes";

export interface ItemRowProps {
  item: Item;
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
  showSizes?: boolean;
}

export function ItemRow({ item, right, onClick, className, showSizes = true }: ItemRowProps) {
  const sizeSummary = formatAvailableSizesSummary(item);
  const content = <>
    <ItemArt artKey={item.artKey} size={48} />
    <span className="min-w-0 flex-1">
      <span className="block truncate font-body text-h3 font-extrabold">{item.name}</span>
      {showSizes ? (
        <span className="block truncate text-small font-bold text-ink-soft">
          Sizes: {sizeSummary}
        </span>
      ) : null}
    </span>
    {right != null && <span className="shrink-0">{right}</span>}
    {onClick && <CaretRight aria-hidden="true" size={20} weight="bold" className="shrink-0 text-ink-soft" />}
  </>;
  const classes = cn(
    "lifted flex min-h-16 w-full items-center gap-3 rounded-md bg-canvas p-3 text-left text-ink",
    onClick && "cursor-pointer active:translate-y-[2px] focus-visible:outline-3 focus-visible:outline-grape-400 focus-visible:outline-offset-2 motion-reduce:active:translate-y-0",
    className,
  );

  return onClick
    ? <button type="button" onClick={onClick} className={classes}>{content}</button>
    : <div className={classes}>{content}</div>;
}
