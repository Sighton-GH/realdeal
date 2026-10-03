import type { MultiBuy } from "@shared/types";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

interface ShelfTagProps {
  price: number;
  wasPrice?: number;
  multiBuy?: MultiBuy;
  name: string;
  sizeLabel: string;
  sale?: boolean;
  size?: "sm" | "lg";
  tilt?: number;
  className?: string;
}

const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3];

export function ShelfTag({ price, wasPrice, multiBuy, name, sizeLabel, sale, size = "lg", tilt = 0, className }: ShelfTagProps) {
  const [dollars, cents] = formatMoney(price).split(".");
  const large = size === "lg";

  return (
    <div
      className={cn("rounded-sm bg-normal text-ink shadow-[0_4px_0_var(--color-normal-lip)]", className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {sale && (
        <div className="rounded-t-sm bg-canvas px-5 py-2 font-display text-h2 font-bold text-high">
          SALE
        </div>
      )}
      <div className={cn("font-body font-extrabold", large ? "p-5" : "p-4")}>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          {multiBuy ? (
            <span className={cn("font-display tabular font-bold leading-none", large ? "text-[64px]" : "text-[32px]")}>
              <span className="block text-h3">{multiBuy.qty} for</span>
              {formatMoney(multiBuy.total)}
            </span>
          ) : (
            <span aria-label={formatMoney(price)} className={cn("inline-flex items-start font-display tabular font-bold leading-none", large ? "text-[64px]" : "text-[32px]")}>
              <span aria-hidden="true">{dollars}</span>
              <span aria-hidden="true" className={cn("pt-1", large ? "text-[32px]" : "text-[16px]")}>.{cents}</span>
            </span>
          )}
          {wasPrice !== undefined && (
            <span className="relative mb-1 inline-block text-small text-ink-soft">
              <span className="sr-only">Previous price: {formatMoney(wasPrice)}</span>
              <span aria-hidden="true">was {formatMoney(wasPrice)}</span>
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -rotate-12 bg-ink-soft" />
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className={large ? "text-h3" : "text-body"}>{name}</p>
            <p className="text-small">{sizeLabel}</p>
          </div>
          <div aria-hidden="true" className="flex h-7 shrink-0 items-stretch gap-0.5">
            {barcodeWidths.map((width, index) => <div key={index} className="bg-ink" style={{ width }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
