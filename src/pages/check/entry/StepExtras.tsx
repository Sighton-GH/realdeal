import { useState } from "react";
import type { Item, RetailerId } from "@shared/types";
import { RETAILERS, retailerById } from "@shared/retailers";
import { StoreTile } from "@/components/ui/StoreTile";
import { PriceText } from "@/components/ui/PriceText";
import { Toggle } from "@/components/ui/Toggle";
import { TextField } from "@/components/ui/TextField";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { formatMoney, formatUnitPrice } from "@/lib/format";
import { toItemSizeQty } from "./entryState";
import { Sheet } from "@/components/ui/Sheet";
import type { ItemSizeOption } from "@/lib/itemSizes";
import { parsePriceInput } from "./PriceKeypad";

export interface StepExtrasProps {
  item: Item;
  retailerId: RetailerId;
  onSelectRetailer?: (id: RetailerId) => void;
  price: string;
  selectedSize?: ItemSizeOption;
  hasWasPrice: boolean;
  setHasWasPrice: (v: boolean) => void;
  wasPrice: string;
  setWasPrice: (v: string) => void;
  hasMultiBuy: boolean;
  setHasMultiBuy: (v: boolean) => void;
  multiBuyQty: number;
  setMultiBuyQty: (v: number) => void;
  multiBuyTotal: string;
  setMultiBuyTotal: (v: string) => void;
  hasCustomSize: boolean;
  setHasCustomSize: (v: boolean) => void;
  customSize: string;
  setCustomSize: (v: string) => void;
  onJumpStep: (step: 1) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function StepExtras({
  item,
  retailerId,
  onSelectRetailer,
  price,
  selectedSize,
  hasWasPrice,
  setHasWasPrice,
  wasPrice,
  setWasPrice,
  hasMultiBuy,
  setHasMultiBuy,
  multiBuyQty,
  setMultiBuyQty,
  multiBuyTotal,
  setMultiBuyTotal,
  hasCustomSize,
  setHasCustomSize,
  customSize,
  setCustomSize,
  onJumpStep,
  onSubmit,
  loading,
}: StepExtrasProps) {
  const mode = useAppStore((s) => s.priceDisplay);
  const [storeSheetOpen, setStoreSheetOpen] = useState(false);
  const retailer = retailerById(retailerId);
  const parsedPrice = parsePriceInput(price);

  const wasNum = Number.parseFloat(wasPrice);
  const wasError =
    hasWasPrice && wasPrice.trim().length > 0 && Number.isFinite(wasNum) && wasNum <= parsedPrice
      ? "The 'was' price should be higher than the price."
      : undefined;

  const totalNum = Number.parseFloat(multiBuyTotal);
  const multiBuyError =
    hasMultiBuy && multiBuyTotal.trim().length > 0 && (!Number.isFinite(totalNum) || totalNum <= 0)
      ? "Total must be greater than $0."
      : undefined;

  const unitPriceEach =
    Number.isFinite(totalNum) && totalNum > 0 ? totalNum / multiBuyQty : null;

  const isWasValid = !hasWasPrice || (wasPrice.trim().length > 0 && Number.isFinite(wasNum) && wasNum > parsedPrice);
  const isMultiBuyValid = !hasMultiBuy || (multiBuyTotal.trim().length > 0 && Number.isFinite(totalNum) && totalNum > 0);
  const sizeNum = Number.parseFloat(customSize);
  const isSizeValid = !hasCustomSize || (customSize.trim().length > 0 && Number.isFinite(sizeNum) && sizeNum > 0);

  const sizeQty = hasCustomSize ? toItemSizeQty(customSize, item.unit) : item.sizeQty;
  const comparisonUnitPrice = sizeQty ? (hasMultiBuy && unitPriceEach !== null ? unitPriceEach : parsedPrice) / sizeQty : undefined;

  const canSubmit = isWasValid && isMultiBuyValid && isSizeValid && !loading;

  const sizeSuffix = item.unit === "kg" ? "g" : item.unit === "L" ? "mL" : "pack";
  const defaultSizePlaceholder =
    item.unit === "kg" || item.unit === "L"
      ? String(Math.round(item.sizeQty * 1000))
      : String(item.sizeQty);

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="font-display text-h2 font-bold text-ink">
        Anything else on the tag?
      </h2>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        <StoreTile
          retailer={retailer}
          size="md"
          onClick={() => setStoreSheetOpen(true)}
          className="cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onJumpStep(1)}
          className="press flex min-h-18 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-line bg-canvas p-2 text-center [--lip:var(--color-line-strong)]"
          aria-label="Change price"
        >
          <span className="text-micro font-bold text-ink-soft">
            Shelf price
          </span>
          <PriceText amount={parsedPrice} size="md" />
        </button>
        <button
          type="button"
          onClick={() => onJumpStep(1)}
          className="press flex min-h-18 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-line bg-canvas p-2 text-center [--lip:var(--color-line-strong)]"
          aria-label="Change package size"
        >
          <span className="text-micro font-bold text-ink-soft">
            Size
          </span>
          <span className="font-display text-small font-extrabold text-ink truncate">
            {selectedSize?.label ?? item.sizeLabel}
          </span>
        </button>
      </div>

      {mode === "unit" && comparisonUnitPrice !== undefined && <p className="text-center text-body font-extrabold">Comparison price: {formatUnitPrice(comparisonUnitPrice, item.unit)}</p>}

      {/* Toggles */}
      <div className="flex flex-col divide-y divide-line rounded-md border-2 border-line bg-canvas p-3">
        {/* Was price toggle */}
        <div className="py-2 first:pt-0">
          <Toggle
            checked={hasWasPrice}
            onChange={setHasWasPrice}
            label="There's a 'was' price"
          />
          {hasWasPrice && (
            <div className="pt-2">
              <TextField
                label="Was price"
                prefix="$"
                inputMode="decimal"
                value={wasPrice}
                onChange={setWasPrice}
                error={wasError}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {/* Multi-buy deal toggle */}
        <div className="py-2">
          <Toggle
            checked={hasMultiBuy}
            onChange={setHasMultiBuy}
            label="It's a multi-buy deal"
          />
          {hasMultiBuy && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-small font-extrabold text-ink">How many</span>
                <Stepper
                  value={multiBuyQty}
                  min={2}
                  max={6}
                  onChange={setMultiBuyQty}
                  label="How many"
                />
              </div>
              <TextField
                label="For"
                prefix="$"
                inputMode="decimal"
                value={multiBuyTotal}
                onChange={setMultiBuyTotal}
                error={multiBuyError}
                placeholder="0.00"
              />
              {unitPriceEach !== null && (
                <p className="text-small font-bold text-ink-soft">
                  {formatMoney(unitPriceEach)} each
                </p>
              )}
            </div>
          )}
        </div>

        {/* Package size toggle (hidden for dozen) */}
        {item.unit !== "dozen" && (
          <div className="py-2 last:pb-0">
            <Toggle
              checked={hasCustomSize}
              onChange={setHasCustomSize}
              label="The package size is different"
              description="Shrinkflation check: enter the size printed on this package."
            />
            {hasCustomSize && (
              <div className="pt-2">
                <TextField
                  label="Package size"
                  suffix={sizeSuffix}
                  inputMode="decimal"
                  value={customSize}
                  onChange={setCustomSize}
                  placeholder={defaultSizePlaceholder}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned bottom action */}
      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Check price
        </Button>
      </div>

      {/* Store Selection Sheet */}
      <Sheet open={storeSheetOpen} onClose={() => setStoreSheetOpen(false)} title="Which store?">
        <div className="grid grid-cols-2 gap-3 py-2">
          {RETAILERS.map((r) => (
            <StoreTile
              key={r.id}
              retailer={r}
              size="md"
              selected={retailerId === r.id}
              onClick={() => {
                onSelectRetailer?.(r.id);
                setStoreSheetOpen(false);
              }}
            />
          ))}
        </div>
      </Sheet>
    </div>
  );
}