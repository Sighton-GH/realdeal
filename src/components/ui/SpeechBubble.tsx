// STUB (SPEC-00). UI-06 replaces; props are final.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SpeechBubbleProps { children: ReactNode; tail?: "left" | "bottom"; className?: string }

export function SpeechBubble({ children, className }: SpeechBubbleProps) {
  return <div className={cn("rounded-md border-2 border-line bg-canvas px-4 py-3 font-bold", className)}>{children}</div>;
}
