import type { ReactNode } from "react";
import type { VerdictTier } from "@shared/types";
import { cn } from "@/lib/cn";

export interface CardProps {
  children: ReactNode;
  interactive?: boolean;
  tone?: "default" | "sunken" | VerdictTier;
  onClick?: () => void;
  as?: "div" | "button" | "li";
  className?: string;
}

const toneClass: Record<NonNullable<CardProps["tone"]>, string> = {
  default: "lifted bg-canvas",
  sunken: "border-2 border-b-4 border-transparent bg-sunken",
  steal: "lifted bg-steal-tint border-steal border-b-steal-lip",
  good: "lifted bg-good-tint border-good border-b-good-lip",
  normal: "lifted bg-normal-tint border-normal border-b-normal-lip",
  high: "lifted bg-high-tint border-high border-b-high-lip",
};

export function Card({ children, interactive, tone = "default", onClick, as, className }: CardProps) {
  const isButton = interactive || as === "button";
  const base = cn("rounded-md p-4 text-left", toneClass[tone]);

  if (isButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          base,
          "block w-full cursor-pointer transition-[transform,border-width] duration-100 ease-out",
          "active:translate-y-0.5 active:border-b-2",
          className,
        )}
      >
        {children}
      </button>
    );
  }
  if (as === "li") {
    return <li className={cn(base, className)}>{children}</li>;
  }
  return <div className={cn(base, className)}>{children}</div>;
}
