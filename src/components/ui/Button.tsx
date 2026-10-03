import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sfx";
import { tierMeta } from "@/lib/tier";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "steal" | "good" | "normal" | "high";
export interface ButtonVisualProps {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  loading?: boolean;
  className?: string;
}
export type ButtonProps = ButtonVisualProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: "bg-grape-500 text-white [--lip:var(--color-grape-700)]",
  secondary: "bg-canvas text-grape-500 border-2 border-line [--lip:var(--color-line-strong)]",
  ghost: "bg-transparent text-grape-500 shadow-none hover:bg-sunken active:translate-y-1",
  steal: `${tierMeta.steal.bgClass} ${tierMeta.steal.textOnFaceClass} [--lip:var(--color-steal-lip)]`,
  good: `${tierMeta.good.bgClass} ${tierMeta.good.textOnFaceClass} [--lip:var(--color-good-lip)]`,
  normal: `${tierMeta.normal.bgClass} ${tierMeta.normal.textOnFaceClass} [--lip:var(--color-normal-lip)]`,
  high: `${tierMeta.high.bgClass} ${tierMeta.high.textOnFaceClass} [--lip:var(--color-high-lip)]`,
};

export function buttonClass({ variant = "primary", size = "lg", fullWidth, className }: ButtonVisualProps): string {
  return cn(
    "relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-md px-5 font-display font-semibold uppercase tracking-[0.04em] select-none cursor-pointer",
    variant !== "ghost" && "press",
    size === "lg" ? "h-14 text-[17px]" : "h-12 text-[15px]",
    fullWidth && "w-full",
    buttonVariantClass[variant],
    "focus-visible:outline-3 focus-visible:outline-grape-400 focus-visible:outline-offset-2",
    "disabled:bg-sunken disabled:text-ink-soft disabled:[--lip:var(--color-line-strong)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-[0_4px_0_var(--color-line-strong)] disabled:filter-none",
    "aria-disabled:bg-sunken aria-disabled:text-ink-soft aria-disabled:[--lip:var(--color-line-strong)] aria-disabled:cursor-not-allowed aria-disabled:translate-y-0 aria-disabled:shadow-[0_4px_0_var(--color-line-strong)] aria-disabled:filter-none",
    "motion-reduce:transition-none",
    className,
  );
}

export function Button({ variant, size, fullWidth, leftIcon, loading, className, children, onClick, disabled, type = "button", ...rest }: ButtonProps) {
  const reducedMotion = useReducedMotion();
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={(event) => { play("tap"); onClick?.(event); }}
      className={buttonClass({ variant, size, fullWidth, className })}
    >
      <span className={cn("inline-flex items-center justify-center gap-2.5", loading && "invisible")} aria-hidden={loading || undefined}>
        {leftIcon && <span aria-hidden="true" className="inline-flex size-[22px] shrink-0 items-center justify-center [&_svg]:size-[22px]">{leftIcon}</span>}
        {children}
      </span>
      {loading && <>
        <span className="sr-only">{children}</span>
        <span role="status" className="sr-only">Loading</span>
        <span aria-hidden="true" className="absolute inset-0 inline-flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((dot) => <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-current"
            animate={reducedMotion ? { opacity: [0.35, 1, 0.35] } : { y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />)}
        </span>
      </>}
    </button>
  );
}
