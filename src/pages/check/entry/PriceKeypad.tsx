import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Backspace } from "@phosphor-icons/react";
import { PriceText } from "@/components/ui/PriceText";
import { formatMoney } from "@/lib/format";
import { play } from "@/lib/sfx";

export interface PriceKeypadProps {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

/** Parses raw keypad string to number ("" -> 0, "5." -> 5, "5.9" -> 5.9). */
export function parsePriceInput(value: string): number {
  if (!value) return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Pure input rules: max 2 decimals, max 999.99, one ".", no leading zeros. */
export function applyKey(value: string, key: string): string {
  if (key === "clear") {
    return "";
  }
  if (key === "back") {
    return value.length > 0 ? value.slice(0, -1) : "";
  }
  if (key === ".") {
    if (value.includes(".")) return value;
    if (value === "") return "0.";
    const candidate = value + ".";
    const num = Number.parseFloat(candidate);
    if (Number.isFinite(num) && num > 999.99) return value;
    return candidate;
  }
  if (/^[0-9]$/.test(key)) {
    if (value === "0") {
      return key === "0" ? "0" : key;
    }
    if (value === "") {
      return key;
    }
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1] && parts[1].length >= 2) {
        return value;
      }
    }
    const candidate = value + key;
    const num = Number.parseFloat(candidate);
    if (Number.isFinite(num) && num > 999.99) {
      return value;
    }
    return candidate;
  }
  return value;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export function PriceKeypad({ value, onChange, hint }: PriceKeypadProps) {
  const shouldReduceMotion = useReducedMotion();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const clearTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        play("tap");
        onChange(applyKey(value, e.key));
      } else if (e.key === "." || e.key === ",") {
        e.preventDefault();
        play("tap");
        onChange(applyKey(value, "."));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        play("tap");
        onChange(applyKey(value, "back"));
      } else if (e.key === "Escape") {
        e.preventDefault();
        play("tap");
        onChange(applyKey(value, "clear"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange]);

  const handleDigitOrDot = (k: string) => {
    play("tap");
    onChange(applyKey(value, k));
  };

  const handleBackspaceDown = () => {
    isLongPressRef.current = false;
    clearTimer();
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      play("tap");
      onChange(applyKey(value, "clear"));
    }, 500);
  };

  const handleBackspaceUp = () => {
    clearTimer();
  };

  const handleBackspaceClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    clearTimer();
    play("tap");
    onChange(applyKey(value, "back"));
  };

  const parsed = parsePriceInput(value);

  return (
    <div className="flex w-full flex-col items-center gap-6 py-2">
      {/* Big price display */}
      <div className="flex min-h-[72px] flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center" aria-hidden="true">
          <PriceText
            amount={parsed}
            size="xl"
            className={value ? "text-ink" : "text-line-strong"}
          />
          <motion.span
            className="ml-1.5 inline-block h-10 w-[2px] self-center rounded-full bg-grape-400 md:h-12"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    duration: 1,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    ease: "linear",
                  }
            }
          />
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {value ? formatMoney(parsed) : "$0.00"}
        </div>
        {hint && <p className="mt-2 text-small text-ink-soft">{hint}</p>}
      </div>

      {/* 3x4 Keypad Grid */}
      <div
        role="group"
        aria-label="Price keypad"
        className="grid w-full max-w-[340px] grid-cols-3 gap-[10px] select-none"
      >
        {KEYS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitOrDot(digit)}
            className="press flex h-16 w-full cursor-pointer items-center justify-center rounded-md border-2 border-line bg-canvas font-display text-[28px] font-semibold text-ink select-none [--lip:var(--color-line-strong)]"
            aria-label={digit}
          >
            {digit}
          </button>
        ))}

        {/* Decimal point */}
        <button
          type="button"
          onClick={() => handleDigitOrDot(".")}
          className="press flex h-16 w-full cursor-pointer items-center justify-center rounded-md border-2 border-line bg-canvas font-display text-[28px] font-semibold text-ink select-none [--lip:var(--color-line-strong)]"
          aria-label="Decimal point"
        >
          .
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigitOrDot("0")}
          className="press flex h-16 w-full cursor-pointer items-center justify-center rounded-md border-2 border-line bg-canvas font-display text-[28px] font-semibold text-ink select-none [--lip:var(--color-line-strong)]"
          aria-label="0"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onPointerDown={handleBackspaceDown}
          onPointerUp={handleBackspaceUp}
          onPointerLeave={handleBackspaceUp}
          onPointerCancel={handleBackspaceUp}
          onContextMenu={(e) => e.preventDefault()}
          onClick={handleBackspaceClick}
          className="press flex h-16 w-full cursor-pointer items-center justify-center rounded-md border-2 border-line bg-canvas font-display text-[28px] font-semibold text-ink select-none [--lip:var(--color-line-strong)]"
          aria-label="Backspace"
        >
          <Backspace size={28} weight="bold" />
        </button>
      </div>
    </div>
  );
}