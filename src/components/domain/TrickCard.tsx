import { motion, useReducedMotion } from "motion/react";
import { ArrowsIn, Copy, Infinity as InfinityIcon, TagSimple } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { TrickFlag, TrickType } from "@shared/types";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export interface TrickCardProps { trick: TrickFlag; index?: number; compact?: boolean; className?: string }

const TRICK_ICON: Record<TrickType, Icon> = {
  perpetual_sale: InfinityIcon,
  inflated_was_price: TagSimple,
  multibuy_trap: Copy,
  shrinkflation: ArrowsIn,
};

export function TrickCard({ trick, index, compact, className }: TrickCardProps) {
  const reduce = useReducedMotion();
  const TrickIcon = TRICK_ICON[trick.type];
  const pops = index !== undefined && !reduce;

  return (
    <motion.div
      className={cn("lifted rounded-md border-l-[6px] border-l-high bg-canvas", compact ? "p-3" : "p-4", className)}
      initial={pops ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={pops ? { ...spring.pop, delay: (index ?? 0) * 0.15 } : { duration: 0 }}
    >
      <div className={cn("flex gap-3", compact ? "items-center" : "items-start")}>
        <span className={cn("flex shrink-0 items-center justify-center rounded-sm bg-high-tint text-high", compact ? "size-8" : "size-10")}>
          <TrickIcon size={compact ? 20 : 24} weight="bold" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn("font-extrabold text-ink", compact ? "truncate text-small" : "text-h3")}>{trick.title}</h3>
          {!compact && <p className="max-w-[44ch] text-small text-ink-soft">{trick.detail}</p>}
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-high-tint px-2.5 py-1 text-micro font-extrabold text-high-lip">
          {trick.stat}
        </span>
      </div>
    </motion.div>
  );
}
