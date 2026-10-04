// SCR-08: the white result panel content on the reveal. RevealPage (SCR-07) provides the scrolling panel.
import { motion } from "motion/react";
import type { Verdict } from "@shared/types";
import { NearbyPrices, SpeakButton, TrickCard } from "@/components/domain";
import { PennyFace } from "@/components/penny";
import { LinkButton, Section, SpeechBubble } from "@/components/ui";
import { pennyLineFor, tierMeta } from "@/lib/tier";
import { CheaperElsewhere, hasCheaperElsewhere } from "./result/CheaperElsewhere";
import { HistorySection } from "./result/HistorySection";
import { NumbersCard } from "./result/NumbersCard";

export interface RevealResultProps { verdict: Verdict }

export function RevealResult({ verdict }: RevealResultProps) {
  const line = pennyLineFor(verdict);
  const itemId = verdict.item.id;
  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-10">
      <section className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <PennyFace mood={tierMeta[verdict.tier].mood} size={48} />
          <SpeechBubble tail="left" className="min-w-0 flex-1">{line}</SpeechBubble>
        </div>
        <SpeakButton text={line} />
      </section>

      <NumbersCard verdict={verdict} />

      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.15 }}
      >
        {hasCheaperElsewhere(verdict) && <CheaperElsewhere verdict={verdict} />}

        {verdict.tricks.length > 0 && (
          <Section title="Penny noticed">
            <div className="flex flex-col gap-3">
              {verdict.tricks.map((t, i) => <TrickCard key={t.type} trick={t} index={i} />)}
            </div>
          </Section>
        )}

        <HistorySection verdict={verdict} />

        <NearbyPrices
          itemId={itemId}
          checkedPrice={verdict.input.retailerId ? { retailerId: verdict.input.retailerId, unitPrice: verdict.unitPrice } : undefined}
          limit={4}
          title="Prices near you"
        />

        <div className="flex flex-col gap-3">
          <LinkButton to="/check" fullWidth>Check another</LinkButton>
          <LinkButton to={"/item/" + itemId} variant="secondary" fullWidth>See price history</LinkButton>
        </div>
      </motion.div>
    </div>
  );
}
