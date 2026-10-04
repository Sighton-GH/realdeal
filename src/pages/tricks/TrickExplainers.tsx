import type { TrickType } from "@shared/types";
import { cn } from "@/lib/cn";

const WEEKS_ON_SALE = 10;

function ForeverSaleExplainer() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={cn("h-8 rounded-sm border-2", i < WEEKS_ON_SALE ? "border-grape-700 bg-grape-500" : "border-line-strong bg-canvas")}
          />
        ))}
      </div>
      <p className="font-display text-h3 font-semibold">On sale 10 of 12 weeks</p>
    </div>
  );
}

function PriceTag({ children, struck }: { children: string; struck?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center rounded-sm border-2 border-line-strong bg-canvas px-3 font-display text-h3 font-semibold tabular",
        struck && "text-ink-soft line-through",
      )}
    >
      {children}
    </span>
  );
}

function InflatedWasExplainer() {
  const bars = Array.from({ length: 26 }, (_, i) => i >= 4 && i < 8);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <PriceTag struck>was $8.49</PriceTag>
        <div
          role="img"
          aria-label="26 weekly prices. Only 4 weeks reached the was price of $8.49."
          className="relative h-20 min-w-0 flex-1 border-b-2 border-line-strong"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t-2 border-dashed border-high" />
          <div aria-hidden="true" className="flex h-full items-end gap-[2px]">
            {bars.map((high, i) => (
              <span key={i} className={cn("flex-1 rounded-t-[2px]", high ? "h-full bg-high" : "h-[62%] bg-grape-400")} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-small text-ink-soft">Only 4 of the last 26 weeks reached $8.49.</p>
    </div>
  );
}

function MultiBuyExplainer() {
  return (
    <div className="flex flex-col items-start gap-2">
      <PriceTag>2 for $5.00</PriceTag>
      <span className="rounded-full bg-high-tint px-3 py-1 text-small font-extrabold text-ink">you save 9¢ each</span>
      <PriceTag>1 for $2.59</PriceTag>
    </div>
  );
}

function Tub({ grams, heightClass }: { grams: number; heightClass: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-24 items-end">
        <div className={cn("flex w-20 flex-col overflow-hidden rounded-b-md rounded-t-sm border-2 border-grape-700 bg-canvas", heightClass)}>
          <span className="h-3 shrink-0 bg-grape-500" />
          <span className="flex flex-1 items-center justify-center font-display text-small font-semibold">{grams} g</span>
        </div>
      </div>
      <span className="font-display text-small font-semibold tabular">$5.97</span>
    </div>
  );
}

function ShrinkflationExplainer() {
  return (
    <div className="flex items-end gap-6" role="img" aria-label="A 650 gram yogurt tub and a smaller 500 gram tub, both priced at $5.97.">
      <Tub grams={650} heightClass="h-24" />
      <Tub grams={500} heightClass="h-[74px]" />
    </div>
  );
}

export function TrickExplainer({ type }: { type: TrickType }) {
  const body =
    type === "perpetual_sale" ? <ForeverSaleExplainer /> :
    type === "inflated_was_price" ? <InflatedWasExplainer /> :
    type === "multibuy_trap" ? <MultiBuyExplainer /> :
    <ShrinkflationExplainer />;
  return <div className="rounded-md bg-sunken p-4">{body}</div>;
}
