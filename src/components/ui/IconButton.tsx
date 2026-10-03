import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sfx";

export interface IconButtonProps { icon: ReactNode; label: string; variant?: "plain" | "raised"; size?: 40 | 48; onClick?: () => void; className?: string; disabled?: boolean }

export function IconButton({ icon, label, variant = "plain", size = 48, onClick, className, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => { play("tap"); onClick?.(); }}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-ink-soft select-none cursor-pointer focus-visible:outline-3 focus-visible:outline-grape-400 focus-visible:outline-offset-2 motion-reduce:transition-none",
        size === 40 ? "size-10" : "size-12",
        variant === "raised" ? "bg-canvas border-2 border-line [--lip:var(--color-line-strong)]" : "bg-transparent enabled:hover:bg-sunken",
        variant === "raised" && !disabled && "press",
        variant === "raised" && disabled && "shadow-[0_4px_0_var(--color-line-strong)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex size-6 items-center justify-center [&_svg]:size-6">{icon}</span>
    </button>
  );
}
