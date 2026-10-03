import { cn } from "@/lib/cn";
import { TIER_ORDER, tierMeta } from "@/lib/tier";
import type { VerdictTier } from "@shared/types";

const SEGMENTS: Record<VerdictTier, { rule: string; width: string }> = {
  steal: { rule: "25%+ below average", width: "md:w-[25%]" },
  good: { rule: "10–25% below", width: "md:w-[15%]" },
  normal: { rule: "within 10%", width: "md:w-[20%]" },
  high: { rule: "10%+ above", width: "md:w-[40%]" },
};

export function VerdictBand() {
  return (
    <section className="bg-grape-900 py-20 text-white">
      <div className="mx-auto max-w-[1120px] px-5">
        <h2 className="text-h1 font-semibold">Four answers. No maybes.</h2>
        <p className="mt-4 max-w-[60ch] text-body text-white/80">
          Every price is compared with its 90-day average across Save-On-Foods, No Frills, Walmart and T&amp;T, per kg or per litre so package sizes can&apos;t hide anything.
        </p>
        <ul className="mt-10 flex flex-col overflow-hidden rounded-md md:flex-row">
          {TIER_ORDER.map((tier) => {
            const meta = tierMeta[tier];
            const seg = SEGMENTS[tier];
            return (
              <li key={tier} className={cn("w-full px-5 py-5 md:py-6", meta.bgClass, meta.textOnFaceClass, seg.width)}>
                <p className="font-display text-h2 font-semibold">{meta.shortLabel}</p>
                <p className="mt-1 text-small font-bold">{seg.rule}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
