import { useState } from "react";
import type { Item } from "@shared/types";
import { PriceKeypad, parsePriceInput } from "./PriceKeypad";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { getSizesForItem, getDefaultSizeForItem, type ItemSizeOption } from "@/lib/itemSizes";

export interface StepPriceProps {
  item: Item;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  selectedSize?: ItemSizeOption;
  onSelectSize?: (size: ItemSizeOption) => void;
}

export function StepPrice({
  item,
  value,
  onChange,
  onContinue,
  selectedSize: propSelectedSize,
  onSelectSize,
}: StepPriceProps) {
  const sizes = getSizesForItem(item);
  const currentSize = propSelectedSize ?? getDefaultSizeForItem(item);

  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const isPresetSelected = sizes.some(
    (s) => s.label === currentSize.label && Math.abs(s.sizeQty - currentSize.sizeQty) < 0.001,
  );

  const canContinue = parsePriceInput(value) > 0;
  const hint = `Enter shelf price for ${currentSize.label}`;

  const handleSelectSize = (s: ItemSizeOption) => {
    setShowCustom(false);
    onSelectSize?.(s);
  };

  const handleCustomApply = () => {
    const num = Number.parseFloat(customValue);
    if (num > 0) {
      let qty = num;
      if (item.unit === "kg" || item.unit === "L") {
        qty = num / 1000;
      }
      const unitStr = item.unit === "kg" ? "g" : item.unit === "L" ? "mL" : item.unit;
      onSelectSize?.({
        label: `${num} ${unitStr}`,
        sizeQty: qty,
        description: "Custom size",
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Package Size Picker */}
      <div className="flex flex-col gap-2 rounded-md border-2 border-line bg-canvas p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-small font-extrabold text-ink">
            Package size
          </span>
          <span className="text-small font-bold text-ink-soft">
            {currentSize.description ?? currentSize.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {sizes.map((s) => (
            <Chip
              key={s.label}
              selected={currentSize.label === s.label && Math.abs(currentSize.sizeQty - s.sizeQty) < 0.001}
              onClick={() => handleSelectSize(s)}
              className="min-h-11"
            >
              {s.label}
            </Chip>
          ))}
          <Chip
            selected={!isPresetSelected}
            onClick={() => setShowCustom((prev) => !prev)}
            className="min-h-11"
          >
            {!isPresetSelected ? currentSize.label : "+ Other size"}
          </Chip>
        </div>
        {showCustom && (
          <div className="mt-2 flex items-end gap-2 pt-1">
            <div className="flex-1">
              <TextField
                label="Custom size"
                suffix={item.unit === "kg" ? "g" : item.unit === "L" ? "mL" : item.unit}
                inputMode="decimal"
                value={customValue}
                onChange={setCustomValue}
                placeholder={
                  item.unit === "kg" || item.unit === "L"
                    ? String(Math.round(currentSize.sizeQty * 1000))
                    : String(currentSize.sizeQty)
                }
              />
            </div>
            <Button
              size="md"
              variant="secondary"
              onClick={handleCustomApply}
              disabled={!customValue || Number.parseFloat(customValue) <= 0}
            >
              Set
            </Button>
          </div>
        )}
      </div>

      <h2 className="text-center font-display text-h2 font-bold text-ink">
        What's the price on the tag?
      </h2>

      <PriceKeypad value={value} onChange={onChange} hint={hint} />

      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
