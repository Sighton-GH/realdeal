import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowsIn, CaretDown, Copy, Infinity as InfinityIcon, TagSimple, type Icon } from "@phosphor-icons/react";
import type { PriceCheckInput, TrickInfo, TrickType } from "@shared/types";
import { api } from "@/api/client";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { useRunCheck } from "@/pages/check/useRunCheck";
import { TrickExplainer } from "./TrickExplainers";

const ICONS: Record<TrickType, Icon> = {
  perpetual_sale: InfinityIcon,
  inflated_was_price: TagSimple,
  multibuy_trap: Copy,
  shrinkflation: ArrowsIn,
};

const FEATURED_ID: Record<TrickType, string> = {
  perpetual_sale: "feat-butter",
  inflated_was_price: "feat-butter",
  multibuy_trap: "feat-pasta",
  shrinkflation: "feat-yogurt",
};

interface TrickPanelProps {
  trick: TrickInfo;
  open: boolean;
  onToggle: () => void;
}

export function TrickPanel({ trick, open, onToggle }: TrickPanelProps) {
  const reduced = useReducedMotion();
  const { run, running, error } = useRunCheck();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const TrickIcon = ICONS[trick.type];
  const panelId = `trick-panel-${trick.type}`;
  const buttonId = `trick-button-${trick.type}`;

  const checkExample = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const deals = await api.getFeatured();
      const deal = deals.find((d) => d.id === FEATURED_ID[trick.type]);
      if (!deal) {
        setLoadError("That example isn't in this week's flyer yet.");
        return;
      }
      const input: PriceCheckInput = {
        itemId: deal.item.id,
        retailerId: deal.retailerId,
        price: deal.price,
        wasPrice: deal.wasPrice,
        multiBuy: deal.multiBuy,
        sizeQty: deal.sizeQty,
        source: "flyer",
      };
      await run(input);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load the example.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lifted overflow-hidden rounded-md bg-canvas">
      <h3 className="font-body text-h3 font-extrabold">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-12 w-full items-center gap-3 p-3 text-left focus-visible:outline-3 focus-visible:outline-grape-400 focus-visible:-outline-offset-3"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-high-tint text-high">
            <TrickIcon size={26} weight="bold" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span>{trick.name}</span>
            <span className="text-small font-bold text-ink-soft">{trick.oneLiner}</span>
          </span>
          <motion.span
            aria-hidden="true"
            className="flex shrink-0 text-ink-soft"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : spring.sheet}
          >
            <CaretDown size={22} weight="bold" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : spring.sheet}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
              <div className="flex flex-col gap-1">
                <h4 className="text-small font-extrabold">How it works</h4>
                <p className="max-w-[60ch] text-body">{trick.howItWorks}</p>
              </div>
              <TrickExplainer type={trick.type} />
              <div className="flex flex-col gap-1">
                <h4 className="text-small font-extrabold">How Penny catches it</h4>
                <p className="max-w-[60ch] text-body">{trick.howWeCatch}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="md" fullWidth loading={loading || running} onClick={() => void checkExample()}>
                  Check a real example
                </Button>
                {(loadError || error) && (
                  <p role="alert" className={cn("text-small text-ink")}>
                    {loadError ?? error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
