import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, selected = false, icon, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4",
        "font-body text-small font-extrabold whitespace-nowrap transition-colors duration-100",
        selected
          ? "border-grape-500 bg-grape-50 text-grape-500"
          : "border-line bg-canvas text-ink hover:bg-sunken",
        className,
      )}
    >
      {icon ? <span aria-hidden="true" className="inline-flex shrink-0 items-center">{icon}</span> : null}
      {children}
    </button>
  );
}
