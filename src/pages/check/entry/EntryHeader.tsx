import { X } from "@phosphor-icons/react";
import type { Item } from "@shared/types";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ItemArt } from "@/components/art/ItemArt";
import type { ItemSizeOption } from "@/lib/itemSizes";

export interface EntryHeaderProps {
  step: 1 | 2;
  item: Item;
  selectedSize?: ItemSizeOption;
  onClose: () => void;
}

export function EntryHeader({ step, item, selectedSize, onClose }: EntryHeaderProps) {
  const displaySize = selectedSize?.label ?? item.sizeLabel;
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-4 pt-1">
      {/* Top progress and close bar */}
      <div className="flex items-center gap-3">
        <IconButton
          icon={<X size={24} weight="bold" />}
          label="Close"
          size={40}
          onClick={onClose}
        />
        <div className="flex-1">
          <ProgressBar
            value={step / 2}
            tone="brand"
            height={12}
            label={`Step ${step} of 2`}
          />
        </div>
      </div>

      {/* Item summary banner */}
      <div className="flex items-center gap-3 px-1">
        <ItemArt artKey={item.artKey} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-h2 font-bold leading-tight text-ink">
            {item.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sunken px-2.5 py-0.5 text-small font-bold text-ink">
              {displaySize}
            </span>
            {selectedSize?.description && (
              <span className="text-small font-semibold text-ink-soft">
                {selectedSize.description}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}