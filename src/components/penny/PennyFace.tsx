// STUB (SPEC-00). ART-01 replaces; props are final.
import type { PennyMood } from "./types";

export interface PennyFaceProps { mood?: PennyMood; size?: number; className?: string }

export function PennyFace({ mood = "idle", size = 32, className }: PennyFaceProps) {
  return (
    <svg role="img" aria-label={`Penny looks ${mood}`} width={size} height={size} viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="15" fill="#E0793C" />
      <circle cx="12" cy="14" r="2.5" fill="#241B35" />
      <circle cx="20" cy="14" r="2.5" fill="#241B35" />
      <path d="M11 20q5 4 10 0" stroke="#241B35" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
