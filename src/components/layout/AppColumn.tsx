import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AppColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-canvas md:bg-grape-900 md:bg-[url('/pattern.svg')] md:bg-repeat md:py-6">
      <div
        id="app-column"
        className={cn(
          "relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-canvas md:h-[calc(100dvh-48px)] md:max-w-[460px] md:rounded-xl md:shadow-[0_4px_0_var(--color-grape-700)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
