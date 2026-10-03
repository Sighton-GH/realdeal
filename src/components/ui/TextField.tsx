// STUB (SPEC-00). UI-04 replaces; props are final.
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface TextFieldProps {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric"; prefix?: string; suffix?: string; error?: string; className?: string;
}

export function TextField({ label, value, onChange, placeholder, inputMode = "text", prefix, suffix, error, className }: TextFieldProps) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-extrabold">{label}</label>
      <div className={cn("flex h-14 items-center gap-2 rounded-sm border-2 bg-sunken px-4", error ? "border-high" : "border-transparent focus-within:border-grape-400 focus-within:bg-canvas")}>
        {prefix && <span className="text-ink-soft">{prefix}</span>}
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className="min-w-0 flex-1 bg-transparent font-bold outline-none" />
        {suffix && <span className="text-ink-soft">{suffix}</span>}
      </div>
      {error && <p className="text-small text-high-lip">{error}</p>}
    </div>
  );
}
