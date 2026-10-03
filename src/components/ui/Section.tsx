// STUB (SPEC-00). UI-02 replaces; props are final.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionProps { title: string; action?: ReactNode; children: ReactNode; className?: string }

export function Section({ title, action, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-h2 font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
