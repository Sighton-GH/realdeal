import { useId } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export interface TextFieldProps {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric"; prefix?: string; suffix?: string; error?: string; className?: string;
}

export function TextField({ label, value, onChange, placeholder, inputMode = "text", prefix, suffix, error, className }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small font-extrabold text-ink">{label}</label>
      <div
        className={cn(
          "flex h-14 items-center gap-2 rounded-sm border-2 bg-sunken px-4",
          error
            ? "border-high focus-within:bg-canvas"
            : "border-transparent focus-within:border-grape-400 focus-within:bg-canvas",
        )}
      >
        {prefix && <span aria-hidden="true" className="text-body font-bold text-ink-soft">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-body font-bold text-ink outline-none placeholder:font-semibold placeholder:text-ink-soft"
        />
        {suffix && <span aria-hidden="true" className="text-body font-bold text-ink-soft">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-small font-bold text-high-lip">
          <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
