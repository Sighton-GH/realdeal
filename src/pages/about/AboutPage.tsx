import { ArrowsIn, Copy, Infinity as InfinityIcon, TagSimple, type Icon } from "@phosphor-icons/react";
import { ITEMS } from "@shared/seed/items";
import { RETAILERS } from "@shared/retailers";
import type { VerdictTier } from "@shared/types";
import { useTopBar } from "@/components/layout";
import { Penny } from "@/components/penny";
import { DataFreshness } from "@/components/domain/DataFreshness";
import { LinkButton } from "@/components/ui";
import { TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { TIER_ORDER, tierMeta } from "@/lib/tier";

const RULES: Record<VerdictTier, string> = {
  steal: "25%+ below average",
  good: "10–25% below",
  normal: "within 10%",
  high: "10%+ above",
};

interface Trick { tier: VerdictTier; icon: Icon; name: string; line: string; example: string }

const TRICKS: Trick[] = [
  { tier: "steal", icon: InfinityIcon, name: "Forever sale", line: "If it's on sale most weeks, the sale price is just the price.", example: "Butter at Save-On: on sale 10 of the last 12 weeks." },
  { tier: "good", icon: TagSimple, name: "Inflated \"was\" price", line: "A struck-out price nobody actually paid.", example: "Was $8.49? It sold for that 4 weeks out of 26." },
  { tier: "normal", icon: Copy, name: "Multi-buy trap", line: "Buy two, save almost nothing.", example: "2 for $5 spaghetti saves 9¢ a box." },
  { tier: "high", icon: ArrowsIn, name: "Shrinkflation", line: "Same price, less food.", example: "Greek yogurt went from 650 g to 500 g. Price didn't move." },
];

export function AboutPage() {
  useTopBar({ title: "About" });
  const stores = RETAILERS.map((r) => r.name).join(", ");

  return (
    <div className="flex flex-col gap-8 px-5 py-6">
      <header className="flex items-center gap-3">
        <Penny mood="happy" size={96} />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-h1 font-bold">{TAGLINE}</h1>
          <p className="text-body text-ink-soft">
            RealDeal checks a grocery price against 90 days of prices at {RETAILERS.length} Canadian grocers and tells you in seconds.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-semibold">Four answers. No maybes.</h2>
        <p className="text-body">
          Every price is compared with its 90-day average across {stores}, per kg or per litre so package sizes can&apos;t hide anything.
        </p>
        <ul className="flex flex-col overflow-hidden rounded-md">
          {TIER_ORDER.map((tier) => {
            const meta = tierMeta[tier];
            return (
              <li key={tier} className={cn("px-5 py-4", meta.bgClass, meta.textOnFaceClass)}>
                <p className="font-display text-h3 font-semibold">{meta.shortLabel}</p>
                <p className="mt-1 text-small font-bold">{RULES[tier]}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">The tricks Penny catches</h2>
        <ul className="flex flex-col gap-6">
          {TRICKS.map((t) => {
            const meta = tierMeta[t.tier];
            const TrickIcon = t.icon;
            return (
              <li key={t.name} className="flex items-start gap-4">
                <span aria-hidden="true" className={cn("flex size-12 shrink-0 items-center justify-center rounded-md text-white", meta.bgClass)}>
                  <TrickIcon size={26} weight="bold" />
                </span>
                <div>
                  <h3 className="text-h3 font-extrabold">{t.name}</h3>
                  <p className="mt-1 text-body">{t.line}</p>
                  <p className="mt-1 text-small font-bold text-ink-soft">{t.example}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <LinkButton to="/tricks" variant="ghost" className="-ml-5 self-start">See how each trick works</LinkButton>
      </section>

      <section className="flex flex-col gap-3 rounded-md bg-sunken p-5">
        <h2 className="text-h2 font-semibold">Where the numbers come from</h2>
        <p className="text-body">
          We track weekly shelf prices for {ITEMS.length} everyday groceries at {RETAILERS.length} stores, using public price data from Project Hammer and prices collected from the stores&apos; own websites.
        </p>
        <p className="text-body">RealDeal is a prototype. Prices can be out of date, so treat a verdict as a strong hint, not a guarantee.</p>
        <DataFreshness />
      </section>

      <p className="text-small text-ink-soft">Built at StormHacks 2026 at SFU.</p>
    </div>
  );
}
