import type { ReactNode } from "react";
import { Penny } from "@/components/penny";
import type { PennyMood } from "@/components/penny/types";
import { cn } from "@/lib/cn";

export interface EmptyStateProps { mood: PennyMood; title: string; body?: string; action?: ReactNode; className?: string }

export function EmptyState({ mood, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-10 text-center", className)}>
      <Penny mood={mood} size={120} />
      <h2 className="font-display text-h2 font-semibold text-ink">{title}</h2>
      {body && <p className="max-w-[36ch] text-small font-bold text-ink-soft">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
