// STUB (SPEC-00). UI-02 replaces; props are final.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps { children: ReactNode; selected?: boolean; icon?: ReactNode; onClick?: () => void; className?: string }

export function Chip({ children, selected, icon, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-small font-extrabold",
        selected ? "border-grape-500 bg-grape-50 text-grape-500" : "border-line bg-canvas text-ink",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
