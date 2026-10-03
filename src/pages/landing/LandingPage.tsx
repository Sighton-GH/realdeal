import { Scan } from "@phosphor-icons/react";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/penny";
import { TAGLINE } from "@/lib/brand";
import { HeroDemo } from "./HeroDemo";
import { VerdictBand } from "./VerdictBand";
import { TricksRows } from "./TricksRows";
import { DataNote } from "./DataNote";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4">
        <Logo size="md" />
        <LinkButton to="/check" variant="secondary" size="md">
          Check a price
        </LinkButton>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1fr_auto] md:gap-12 md:pb-24 md:pt-12">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h1 className="text-display font-bold md:text-[4rem]">{TAGLINE}</h1>
            <p className="mt-5 max-w-[44ch] text-h3 font-semibold text-ink-soft">
              RealDeal checks a grocery price against 90 days of prices at four BC stores and tells you in seconds: steal, good deal, normal, or overpriced.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <LinkButton to="/check">Check a price</LinkButton>
              <LinkButton to="/scan" variant="secondary" leftIcon={<Scan size={22} weight="bold" aria-hidden="true" />}>
                Scan a price tag
              </LinkButton>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <HeroDemo />
          </div>
        </section>

        <VerdictBand />
        <TricksRows />
        <DataNote />
      </main>

      <LandingFooter />
    </div>
  );
}
