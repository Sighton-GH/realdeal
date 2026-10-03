// STUB (SPEC-00). UI-04 replaces; props are final.
import { Minus, Plus } from "@phosphor-icons/react";
import { IconButton } from "./IconButton";

export interface StepperProps { value: number; min: number; max: number; onChange: (v: number) => void; label: string; className?: string }

export function Stepper({ value, min, max, onChange, label, className }: StepperProps) {
  return (
    <div className={className} role="group" aria-label={label}>
      <div className="flex items-center gap-4">
        <IconButton variant="raised" size={40} label={`Decrease ${label}`} icon={<Minus weight="bold" />} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} />
        <span className="w-8 text-center font-display text-h2 font-bold tabular">{value}</span>
        <IconButton variant="raised" size={40} label={`Increase ${label}`} icon={<Plus weight="bold" />} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} />
      </div>
    </div>
  );
}
