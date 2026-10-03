import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FeaturedDeal, Verdict } from "@shared/types";
import { api } from "@/api/client";
import { Button, Card, LinkButton, SpeechBubble, VerdictBadge } from "@/components/ui";
import { Penny, type PennyMood } from "@/components/penny";
import { TrickCard } from "@/components/domain";
import { spring } from "@/lib/motion";
import { pennyLineFor, tierMeta } from "@/lib/tier";
import { ShelfTag } from "./ShelfTag";

type DemoState =
  | { status: "idle" | "running" | "error" }
  | { status: "result"; verdict: Verdict; suspicious: boolean };

export function HeroDemo() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<DemoState>({ status: "idle" });
  const [deal, setDeal] = useState<FeaturedDeal>();
  const generation = useRef(0);
  const inFlight = useRef(false);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    generation.current += 1;
    clearTimeout(moodTimer.current);
  }, []);

  const reset = () => {
    generation.current += 1;
    clearTimeout(moodTimer.current);
    inFlight.current = false;
    setDeal(undefined);
    setState({ status: "idle" });
  };

  const check = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const request = ++generation.current;
    const started = performance.now();
    setState({ status: "running" });
    try {
      const featured = await api.getFeatured();
      if (request !== generation.current) return;
      const selected = featured.find((candidate) => candidate.id === "feat-butter") ?? featured[0];
      if (!selected) throw new Error("No featured deals available");
      setDeal(selected);
      const verdict = await api.checkPrice({
        itemId: selected.item.id,
        retailerId: selected.retailerId,
        price: selected.price,
        wasPrice: selected.wasPrice,
        multiBuy: selected.multiBuy,
        sizeQty: selected.sizeQty,
        source: "flyer",
      });
      await new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, 900 - (performance.now() - started))));
      if (request !== generation.current) return;
      setState({ status: "result", verdict, suspicious: false });
      if (verdict.tricks.length > 0) {
        moodTimer.current = setTimeout(() => {
          if (request === generation.current) setState({ status: "result", verdict, suspicious: true });
        }, 700);
      }
    } catch {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, 900 - (performance.now() - started))));
      if (request === generation.current) setState({ status: "error" });
    } finally {
      if (request === generation.current) inFlight.current = false;
    }
  };

  const running = state.status === "running";
  let mood: PennyMood = "suspicious";
  if (running) mood = "thinking";
  else if (state.status === "error") mood = "sad";
  else if (state.status === "result") mood = state.suspicious ? "suspicious" : tierMeta[state.verdict.tier].mood;

  return (
    <section aria-label="Try a grocery price check" className="mx-auto w-full max-w-[460px]">
      <div className="relative px-3 pt-14 pb-7 md:pt-20">
        <motion.div
          animate={{ rotate: state.status === "result" ? 0 : -3 }}
          transition={reducedMotion ? { duration: 0 } : spring.pop}
        >
          <ShelfTag
            size="lg"
            sale={deal ? deal.wasPrice !== undefined || deal.multiBuy !== undefined : true}
            price={deal?.price ?? 5.99}
            wasPrice={deal ? deal.wasPrice : 8.49}
            multiBuy={deal?.multiBuy}
            name={deal?.item.name ?? "Salted butter"}
            sizeLabel={deal?.item.sizeLabel ?? "454 g"}
          />
        </motion.div>
        <div className="pointer-events-none absolute -top-1 right-0 z-10">
          <Penny mood={mood} size={100} className="md:hidden" />
          <Penny mood={mood} size={140} className="hidden md:block" />
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {running ? "Penny is checking the tag." : state.status === "result" ? tierMeta[state.verdict.tier].label : ""}
      </div>
      {state.status !== "result" && (
        <div className="flex flex-col items-center gap-3 px-3">
          <Button loading={running} disabled={running} aria-label="Check this tag" onClick={() => { void check(); }} className="w-full sm:w-auto">
            Check this tag
          </Button>
          {state.status === "error" && <p role="alert" className="text-center text-small text-ink-soft">Couldn't check that tag. Tap to try again.</p>}
        </div>
      )}

      <AnimatePresence>
        {state.status === "result" && (
          <motion.div
            key="result"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={reducedMotion ? { duration: 0.15 } : spring.pop}
            className="origin-top space-y-4"
          >
            <Card>
              <div className="space-y-4">
                <VerdictBadge tier={state.verdict.tier} size="md" />
                <SpeechBubble tail="bottom">{pennyLineFor(state.verdict)}</SpeechBubble>
                {state.verdict.tricks.map((trick, index) => <TrickCard key={trick.type} trick={trick} compact index={index} />)}
              </div>
            </Card>
            <div className="flex flex-col items-center gap-1">
              <LinkButton to="/check" variant="ghost" className="h-auto min-h-12 w-full whitespace-normal py-3 text-center normal-case tracking-normal">
                Try it on your own groceries
              </LinkButton>
              <Button variant="ghost" size="md" onClick={reset} className="normal-case tracking-normal">Check again</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
