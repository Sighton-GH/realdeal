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
import { EntryHeader } from "./entry/EntryHeader";
import { StepStore } from "./entry/StepStore";
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

  const [retailerId, setRetailerId] = useState<RetailerId | null>(initialState.retailerId);
  const [price, setPrice] = useState<string>(initialState.price);
  const [hasWasPrice, setHasWasPrice] = useState<boolean>(initialState.hasWasPrice);
  const [wasPrice, setWasPrice] = useState<string>(initialState.wasPrice);
  const [hasMultiBuy, setHasMultiBuy] = useState<boolean>(initialState.hasMultiBuy);
  const [multiBuyQty, setMultiBuyQty] = useState<number>(initialState.multiBuyQty);
  const [multiBuyTotal, setMultiBuyTotal] = useState<string>(initialState.multiBuyTotal);
  const [hasCustomSize, setHasCustomSize] = useState<boolean>(initialState.hasCustomSize);
  const [customSize, setCustomSize] = useState<string>(initialState.customSize);

  // Sync step from search params (enables browser back/forward)
  const stepParam = searchParams.get("step");
  const requestedStep: EntryStep =
    stepParam === "1" || stepParam === "2" || stepParam === "3"
      ? (Number.parseInt(stepParam, 10) as EntryStep)
      : initialState.step;
  // A shared or stale URL can ask for a step we can't show yet: fall back to the last complete one
  const step: EntryStep = !retailerId ? 1 : requestedStep === 3 && parsePriceInput(price) <= 0 ? 2 : requestedStep;

  const setStep = (nextStep: EntryStep) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("step", String(nextStep));
      if (retailerId) next.set("store", retailerId);
      if (price) next.set("price", price);
      return next;
    });
  };

  const handleClose = () => {
    navigate("/check");
  };

  const handleStoreSelect = (selected: RetailerId) => {
    setRetailerId(selected);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("store", selected);
      next.set("step", "2");
      return next;
    });
  };

  const handlePriceContinue = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("step", "3");
      if (price) next.set("price", price);
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
    }

    void run(input);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[420px] flex-col px-4 pb-8 pt-2">
      <EntryHeader step={step} item={item} onClose={handleClose} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" {...stepSlide} className="w-full">
              <StepStore selectedId={retailerId} onSelect={handleStoreSelect} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" {...stepSlide} className="w-full">
              <StepPrice
                item={item}
                value={price}
                onChange={setPrice}
                onContinue={handlePriceContinue}
              />
            </motion.div>
          )}

          {step === 3 && retailerId && (
            <motion.div key="step-3" {...stepSlide} className="w-full">
              <StepExtras
                item={item}
                retailerId={retailerId}
                price={price}
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