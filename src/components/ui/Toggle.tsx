import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; className?: string }

export function Toggle({ checked, onChange, label, description, className }: ToggleProps) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-sm py-2 text-left", className)}
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-body font-extrabold text-ink">{label}</span>
        {description && <span className="text-small font-bold text-ink-soft">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-150",
          checked ? "bg-grape-500" : "bg-line-strong",
        )}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={reduce ? { duration: 0.15 } : spring.press}
          className={cn(
            "absolute left-1 top-1 size-6 rounded-full bg-white",
            checked ? "shadow-[0_2px_0_var(--color-grape-700)]" : "shadow-[0_2px_0_var(--color-ink-soft)]",
          )}
        />
      </span>
    </button>
  );
}
