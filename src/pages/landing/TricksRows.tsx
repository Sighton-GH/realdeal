import { ArrowsIn, Copy, Infinity as InfinityIcon, TagSimple, type Icon } from "@phosphor-icons/react";
import { LinkButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tierMeta } from "@/lib/tier";
import type { VerdictTier } from "@shared/types";

interface Trick {
  tier: VerdictTier;
  icon: Icon;
  name: string;
  line: string;
  example: string;
}

const TRICKS: Trick[] = [
  { tier: "steal", icon: InfinityIcon, name: "Forever sale", line: "If it's on sale most weeks, the sale price is just the price.", example: "Butter at Save-On: on sale 10 of the last 12 weeks." },
  { tier: "good", icon: TagSimple, name: "Inflated \"was\" price", line: "A struck-out price nobody actually paid.", example: "Was $8.49? It sold for that 4 weeks out of 26." },
  { tier: "normal", icon: Copy, name: "Multi-buy trap", line: "Buy two, save almost nothing.", example: "2 for $5 spaghetti saves 9¢ a box." },
  { tier: "high", icon: ArrowsIn, name: "Shrinkflation", line: "Same price, less food.", example: "Greek yogurt went from 650 g to 500 g. Price didn't move." },
];

export function TricksRows() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1120px] px-5">
        <h2 className="text-h1 font-semibold">The tricks Penny catches</h2>
        <ul className="mt-10 flex flex-col gap-10">
          {TRICKS.map((t, i) => {
            const meta = tierMeta[t.tier];
            const TrickIcon = t.icon;
            return (
              <li key={t.name} className={cn("flex items-start gap-5 md:max-w-[640px]", i % 2 === 1 && "md:ml-auto md:flex-row-reverse md:text-right")}>
                <span aria-hidden="true" className={cn("flex size-14 shrink-0 items-center justify-center rounded-md text-white", meta.bgClass)}>
                  <TrickIcon size={30} weight="bold" />
                </span>
                <div>
                  <h3 className="text-h3 font-extrabold">{t.name}</h3>
                  <p className="mt-1 text-body">{t.line}</p>
                  <p className="mt-2 text-small font-bold text-ink-soft">{t.example}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <LinkButton to="/tricks" variant="ghost" className="-ml-5">
            See how each trick works
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
