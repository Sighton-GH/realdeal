// FROZEN API (SPEC-00). The phone-width column on a grape stage (desktop). Used by AppShell and by full-bleed pages (Reveal, Scan).
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AppColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh md:bg-grape-900 md:bg-[url('/pattern.svg')] md:py-6">
      <div
        id="app-column"
        className={cn(
          "relative mx-auto flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-canvas md:h-[calc(100dvh-48px)] md:rounded-xl md:shadow-[0_4px_0_var(--color-grape-700)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
