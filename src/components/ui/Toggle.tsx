// STUB (SPEC-00). UI-04 replaces; props are final.
import { cn } from "@/lib/cn";

export interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; className?: string }

export function Toggle({ checked, onChange, label, description, className }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn("flex w-full items-center justify-between gap-4 py-2 text-left", className)}>
      <span>
        <span className="block font-extrabold">{label}</span>
        {description && <span className="block text-small text-ink-soft">{description}</span>}
      </span>
      <span className={cn("relative h-8 w-[52px] shrink-0 rounded-full transition-colors", checked ? "bg-grape-500" : "bg-line-strong")}>
        <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white transition-all", checked ? "left-[24px]" : "left-1")} />
      </span>
    </button>
  );
}
