import { useRef } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

export interface SearchFieldProps { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; autoFocus?: boolean; className?: string }

export function SearchField({ value, onChange, onSubmit, placeholder = "Search", autoFocus, className }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 rounded-md border-2 border-line bg-sunken pl-4 pr-2 focus-within:border-grape-400 focus-within:bg-canvas",
        className,
      )}
    >
      <MagnifyingGlass aria-hidden="true" className="size-6 shrink-0 text-ink-soft" />
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        className="h-full min-w-0 flex-1 appearance-none bg-transparent text-body font-bold text-ink outline-none placeholder:font-semibold placeholder:text-ink-soft [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none"
      />
      {value !== "" && (
        <IconButton
          icon={<X />}
          label="Clear search"
          size={40}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
