import { useEffect, useState } from "react";

/** Debounce a value by delay ms. Returns the settled value. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return settled;
}
