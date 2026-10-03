import type { Item } from "@shared/types";
import { PriceKeypad, parsePriceInput } from "./PriceKeypad";
import { Button } from "@/components/ui/Button";

export interface StepPriceProps {
  item: Item;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

export function StepPrice({ item, value, onChange, onContinue }: StepPriceProps) {
  const hint = item.unit === "kg" && item.sizeLabel === "per kg" ? "Enter the price per kg." : undefined;
  const canContinue = parsePriceInput(value) > 0;

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="font-display text-h2 font-bold text-ink text-center">
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