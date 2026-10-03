// STUB (SPEC-00). UI-03 replaces; props are final.
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-sm bg-sunken", className)} />;
}
