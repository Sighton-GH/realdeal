// STUB (SPEC-00). UI-01 replaces with the polished version; props are final.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sfx";

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
  ghost: "bg-transparent text-grape-500 shadow-none hover:bg-sunken",
  steal: "bg-steal text-white [--lip:var(--color-steal-lip)]",
  good: "bg-good text-white [--lip:var(--color-good-lip)]",
  normal: "bg-normal text-ink [--lip:var(--color-normal-lip)]",
  high: "bg-high text-white [--lip:var(--color-high-lip)]",
};

export function buttonClass({ variant = "primary", size = "lg", fullWidth, className }: ButtonVisualProps): string {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-md px-5 font-display font-semibold uppercase tracking-[0.04em] select-none",
    variant !== "ghost" && "press",
    size === "lg" ? "h-14 text-[17px]" : "h-12 text-[15px]",
    fullWidth && "w-full",
    buttonVariantClass[variant],
    "disabled:bg-sunken disabled:text-ink-soft disabled:[--lip:var(--color-line-strong)] disabled:cursor-not-allowed",
    className,
  );
}

export function Button({ variant, size, fullWidth, leftIcon, loading, className, children, onClick, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={(e) => { play("tap"); onClick?.(e); }}
      className={buttonClass({ variant, size, fullWidth, className })}
    >
      {loading ? <span aria-hidden>...</span> : <>{leftIcon}{children}</>}
    </button>
  );
}
