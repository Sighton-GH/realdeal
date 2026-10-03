import { cn } from "@/lib/cn";
import { Face } from "./parts/Face";
import type { PennyMood } from "./types";

export interface PennyFaceProps {
  mood?: PennyMood;
  size?: number;
  className?: string;
}

/** Head only: the coin and face, cropped to the circle. Static, legible at 24 to 48px. */
export function PennyFace({ mood = "idle", size = 32, className }: PennyFaceProps) {
  return (
    <svg
      viewBox="22 30 156 156"
      width={size}
      height={size}
      role="img"
      aria-label={`Penny looks ${mood}`}
      className={cn("shrink-0", className)}
    >
      <Face mood={mood} still />
    </svg>
  );
}
