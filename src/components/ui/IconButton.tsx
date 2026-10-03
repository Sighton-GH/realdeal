// STUB (SPEC-00). UI-01 replaces; props are final.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps { icon: ReactNode; label: string; variant?: "plain" | "raised"; size?: 40 | 48; onClick?: () => void; className?: string; disabled?: boolean }

export function IconButton({ icon, label, variant = "plain", size = 48, onClick, className, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-ink-soft disabled:opacity-40",
        variant === "raised" ? "press bg-canvas border-2 border-line" : "hover:bg-sunken",
        className,
      )}
    >
      {icon}
    </button>
  );
}
