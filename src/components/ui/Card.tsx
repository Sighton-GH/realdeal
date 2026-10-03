// STUB (SPEC-00). UI-02 replaces; props are final.
import type { ReactNode } from "react";
import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";
import { tierMeta } from "@/lib/tier";

export interface CardProps { children: ReactNode; interactive?: boolean; tone?: "default" | "sunken" | VerdictTier; onClick?: () => void; as?: "div" | "button" | "li"; className?: string }

export function Card({ children, interactive, tone = "default", onClick, as, className }: CardProps) {
  const Tag = as ?? (interactive ? "button" : "div");
  const toneClass =
    tone === "default" ? "lifted bg-canvas" :
    tone === "sunken" ? "bg-sunken" :
    cn("lifted", tierMeta[tone].tintClass, tierMeta[tone].borderClass);
  return (
    <Tag
      onClick={onClick}
      {...(Tag === "button" ? { type: "button" as const } : {})}
      className={cn("block w-full rounded-md p-4 text-left", toneClass, interactive && "active:translate-y-[2px]", className)}
    >
      {children}
    </Tag>
  );
}
