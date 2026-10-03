import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SpeechBubbleProps { children: ReactNode; tail?: "left" | "bottom"; className?: string }

export function SpeechBubble({ children, tail = "left", className }: SpeechBubbleProps) {
  return (
    <div className={cn("relative rounded-md border-2 border-line bg-canvas px-4 py-3 font-bold text-ink", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "absolute size-3 rotate-45 bg-canvas",
          tail === "left"
            ? "-left-[7px] top-1/2 -mt-1.5 border-b-2 border-l-2 border-line"
            : "-bottom-[7px] left-6 border-b-2 border-r-2 border-line",
        )}
      />
      {children}
    </div>
  );
}
