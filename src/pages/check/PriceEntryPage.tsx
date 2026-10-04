import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import type { Item, PriceCheckInput, RetailerId } from "@shared/types";
import { api } from "@/api/client";
import { useRunCheck } from "@/pages/check/useRunCheck";
import { useTopBar } from "@/components/layout/TopBarContext";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { stepSlide } from "@/lib/motion";
import { getDefaultSizeForItem, getSizesForItem, type ItemSizeOption } from "@/lib/itemSizes";
import { EntryHeader } from "./entry/EntryHeader";
import { StepPrice } from "./entry/StepPrice";
import { StepExtras } from "./entry/StepExtras";
import { parseInitialEntryState, toItemSizeQty, type EntryStep } from "./entry/entryState";
import { parsePriceInput } from "./entry/PriceKeypad";

/** Loads the item, then mounts the flow so its state starts from the real unit (prefill depends on it). */
export function PriceEntryPage() {
  const { itemId } = useParams();

  // Hide the shell's top bar; this page draws its own lesson-style header
  useTopBar({ hidden: true });

  const { data: itemDetail, isLoading, isError } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => api.getItem(itemId!),
    enabled: Boolean(itemId),
  });
  const item = itemDetail?.item;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-6 p-4">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <EmptyState
          mood="sad"
          title="Penny can't find that item."
          action={<LinkButton to="/check">Back to search</LinkButton>}
        />
      </div>
    );
  }

  return <PriceEntryFlow key={item.id} item={item} />;
}

function PriceEntryFlow({ item }: { item: Item }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();
  const { run, running, error } = useRunCheck();

  useEffect(() => {
    if (error) {
      toast.show({ message: error, tone: "high" });
    }
  }, [error, toast]);

  const [initialState] = useState(() => parseInitialEntryState(searchParams, item));

  const [selectedSize, setSelectedSize] = useState<ItemSizeOption>(() => {
    const sizes = getSizesForItem(item);
    const sizeParam = searchParams.get("size");
    if (sizeParam) {
      const sizeNum = Number.parseFloat(sizeParam);
      const found = sizes.find((s) => Math.abs(s.sizeQty - sizeNum) < 0.001);
      if (found) return found;
      return {
        label: searchParams.get("sizeLabel") || `${sizeNum} ${item.unit}`,
        sizeQty: sizeNum,
        description: "Custom size",
      };
    }
    return getDefaultSizeForItem(item);
  });

  const [retailerId, setRetailerId] = useState<RetailerId>(initialState.retailerId);
  const [price, setPrice] = useState<string>(initialState.price);
  const [hasWasPrice, setHasWasPrice] = useState<boolean>(initialState.hasWasPrice);
  const [wasPrice, setWasPrice] = useState<string>(initialState.wasPrice);
  const [hasMultiBuy, setHasMultiBuy] = useState<boolean>(initialState.hasMultiBuy);
  const [multiBuyQty, setMultiBuyQty] = useState<number>(initialState.multiBuyQty);
  const [multiBuyTotal, setMultiBuyTotal] = useState<string>(initialState.multiBuyTotal);
  const [hasCustomSize, setHasCustomSize] = useState<boolean>(initialState.hasCustomSize);
  const [customSize, setCustomSize] = useState<string>(initialState.customSize);

  const handleSelectSize = (newSize: ItemSizeOption) => {
    setSelectedSize(newSize);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("size", String(newSize.sizeQty));
      next.set("sizeLabel", newSize.label);
      return next;
    });
  };

  const handleSelectRetailer = (selected: RetailerId) => {
    setRetailerId(selected);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("store", selected);
      return next;
    });
  };

  // Sync step from search params (enables browser back/forward)
  const stepParam = searchParams.get("step");
  const requestedStep: EntryStep =
    stepParam === "2"
      ? 2
      : 1;
  const step: EntryStep = requestedStep === 2 && parsePriceInput(price) <= 0 ? 1 : requestedStep;

  const setStep = (nextStep: EntryStep) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("step", String(nextStep));
      if (retailerId) next.set("store", retailerId);
      if (price) next.set("price", price);
      next.set("size", String(selectedSize.sizeQty));
      next.set("sizeLabel", selectedSize.label);
      return next;
    });
  };

  const handleClose = () => {
    navigate("/check");
  };

  const handlePriceContinue = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("step", "2");
      if (price) next.set("price", price);
      next.set("size", String(selectedSize.sizeQty));
      next.set("sizeLabel", selectedSize.label);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!item || !retailerId) return;

    const priceNum = parsePriceInput(price);
    const input: PriceCheckInput = {
      itemId: item.id,
      retailerId,
      price: priceNum,
      source: "manual",
    };

    if (hasWasPrice && wasPrice.trim().length > 0) {
      const wasNum = Number.parseFloat(wasPrice);
      if (Number.isFinite(wasNum) && wasNum > priceNum) {
        input.wasPrice = wasNum;
      }
    }

    if (hasMultiBuy && multiBuyTotal.trim().length > 0) {
      const totalNum = Number.parseFloat(multiBuyTotal);
      if (Number.isFinite(totalNum) && totalNum > 0) {
        input.multiBuy = {
          qty: multiBuyQty,
          total: totalNum,
        };
      }
    }

    if (hasCustomSize && customSize.trim().length > 0) {
      const sizeQty = toItemSizeQty(customSize, item.unit);
      if (sizeQty !== undefined) {
        input.sizeQty = sizeQty;
      }
    } else {
      input.sizeQty = selectedSize.sizeQty;
    }

    void run(input);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[420px] flex-col px-4 pb-8 pt-2">
      <EntryHeader step={step} item={item} selectedSize={selectedSize} onClose={handleClose} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" {...stepSlide} className="w-full">
              <StepPrice
                item={item}
                value={price}
                onChange={setPrice}
                onContinue={handlePriceContinue}
                selectedSize={selectedSize}
                onSelectSize={handleSelectSize}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" {...stepSlide} className="w-full">
              <StepExtras
                item={item}
                retailerId={retailerId}
                onSelectRetailer={handleSelectRetailer}
                price={price}
                selectedSize={selectedSize}
                hasWasPrice={hasWasPrice}
                setHasWasPrice={setHasWasPrice}
                wasPrice={wasPrice}
                setWasPrice={setWasPrice}
                hasMultiBuy={hasMultiBuy}
                setHasMultiBuy={setHasMultiBuy}
                multiBuyQty={multiBuyQty}
                setMultiBuyQty={setMultiBuyQty}
                multiBuyTotal={multiBuyTotal}
                setMultiBuyTotal={setMultiBuyTotal}
                hasCustomSize={hasCustomSize}
                setHasCustomSize={setHasCustomSize}
                customSize={customSize}
                setCustomSize={setCustomSize}
                onJumpStep={(s) => setStep(s)}
                onSubmit={handleSubmit}
                loading={running}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}