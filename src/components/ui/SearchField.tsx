// STUB (SPEC-00). UI-04 replaces; props are final.
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export interface SearchFieldProps { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; autoFocus?: boolean; className?: string }

export function SearchField({ value, onChange, onSubmit, placeholder = "Search", autoFocus, className }: SearchFieldProps) {
  return (
    <div className={cn("flex h-14 items-center gap-3 rounded-md border-2 border-line bg-sunken px-4 focus-within:border-grape-400 focus-within:bg-canvas", className)}>
      <MagnifyingGlass size={22} weight="bold" className="text-ink-soft" />
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit?.(); }}
        className="min-w-0 flex-1 bg-transparent font-bold outline-none"
      />
    </div>
  );
}
