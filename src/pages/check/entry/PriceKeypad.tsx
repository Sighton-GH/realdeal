// STUB (SPEC-00). SCR-06 replaces. Contract used by PriceEntryPage (SCR-05):
//   PriceKeypad({ value, onChange, hint }) where value is the raw typed string ("5.9"), max 2 decimals, max 999.99
//   parsePriceInput(value): number  (NaN-safe; "" -> 0)
export interface PriceKeypadProps { value: string; onChange: (value: string) => void; hint?: string }

export function parsePriceInput(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function PriceKeypad({ value, onChange, hint }: PriceKeypadProps) {
  return (
    <div className="flex flex-col gap-2">
      <input aria-label="Price" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="h-14 rounded-sm bg-sunken px-4 font-display text-[32px]" />
      {hint && <p className="text-small text-ink-soft">{hint}</p>}
    </div>
  );
}
