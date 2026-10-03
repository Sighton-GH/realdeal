// STUB (SPEC-00). SCR-09 replaces; props are final.
import type { TrickFlag } from "@shared/types";

export interface TrickCardProps { trick: TrickFlag; index?: number; compact?: boolean; className?: string }

export function TrickCard({ trick, compact, className }: TrickCardProps) {
  return (
    <div className={`lifted rounded-md border-l-[6px] border-l-high bg-canvas p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold">{trick.title}</span>
        <span className="rounded-full bg-high-tint px-2 py-0.5 text-micro font-extrabold text-high-lip">{trick.stat}</span>
      </div>
      {!compact && <p className="mt-1 text-small text-ink-soft">{trick.detail}</p>}
    </div>
  );
}
