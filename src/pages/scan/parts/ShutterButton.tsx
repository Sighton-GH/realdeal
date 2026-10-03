import { cn } from "@/lib/cn";

/** 76px white circle inside a 6px white ring with a 4px gap. Presses down 4px. */
export function ShutterButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div className={cn("rounded-full border-[6px] border-white p-1", disabled && "opacity-50")}>
      <button
        type="button"
        aria-label="Take photo"
        disabled={disabled}
        onClick={onClick}
        className="press block size-[76px] rounded-full bg-white [--lip:var(--color-line-strong)] disabled:cursor-not-allowed"
      />
    </div>
  );
}
