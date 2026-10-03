// STUB (SPEC-00). ART-01 replaces with the animated mascot; props are final.
import { cn } from "@/lib/cn";
import type { PennyMood } from "./types";

export interface PennyProps { mood: PennyMood; size?: number; className?: string }

export function Penny({ mood, size = 120, className }: PennyProps) {
  return (
    <svg role="img" aria-label={`Penny looks ${mood}`} width={size} height={size * 1.1} viewBox="0 0 200 220" className={cn("shrink-0", className)}>
      <title>{mood}</title>
      <circle cx="100" cy="108" r="78" fill="#E0793C" />
      <ellipse cx="76" cy="98" rx="13" ry="16" fill="#fff" />
      <ellipse cx="124" cy="98" rx="13" ry="16" fill="#fff" />
      <circle cx="78" cy="100" r="8" fill="#241B35" />
      <circle cx="122" cy="100" r="8" fill="#241B35" />
      <path d="M84 138q16 12 32 0" stroke="#241B35" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
