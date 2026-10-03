import type { PricePoint } from "@shared/types";
import { formatMoney, formatWeek } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface SaleStreakProps {
  points: PricePoint[];
  weeks?: number;
  className?: string;
}

export function SaleStreak({ points, weeks = 12, className }: SaleStreakProps) {
  const slice = points.slice(-weeks);
  const onSaleCount = slice.filter((p) => p.onSale).length;

  return (
    <div
      role="group"
      aria-label={`On sale ${onSaleCount} of the last ${weeks} weeks`}
      className={cn("flex items-center gap-1", className)}
    >
      {slice.map((p) => {
        const title = `${formatWeek(p.date)}: ${formatMoney(p.price)}${p.onSale ? ", on sale" : ""}`;
        const isMultiBuy = Boolean(p.multiBuy);

        if (isMultiBuy) {
          return (
            <span
              key={p.date}
              title={title}
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] bg-grape-500"
            >
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
          );
        }

        if (p.onSale) {
          return (
            <span
              key={p.date}
              title={title}
              className="h-3.5 w-3.5 shrink-0 rounded-[4px] bg-grape-500"
            />
          );
        }

        return (
          <span
            key={p.date}
            title={title}
            className="h-3.5 w-3.5 shrink-0 rounded-[4px] border-[1.5px] border-line bg-sunken"
          />
        );
      })}
    </div>
  );
}