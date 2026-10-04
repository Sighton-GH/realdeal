import { Minus, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

export interface StepperProps { value: number; min: number; max: number; onChange: (v: number) => void; label: string; className?: string }

export function Stepper({ value, min, max, onChange, label, className }: StepperProps) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center gap-4", className)}>
      <IconButton
        icon={<Minus />}
        label={`Decrease ${label}`}
        variant="raised"
        size={40}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <span aria-live="polite" className="min-w-8 text-center font-display text-h2 font-bold tabular text-ink">{value}</span>
      <IconButton
        icon={<Plus />}
        label={`Increase ${label}`}
        variant="raised"
        size={40}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </div>
  );
}
