import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import type { Verdict } from "@shared/types";
import { AppColumn } from "@/components/layout";
import { EmptyState, IconButton, LinkButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { tierMeta } from "@/lib/tier";
import { useAppStore } from "@/store/useAppStore";
import { RevealResult } from "./RevealResult";
import { Stage } from "./stage/Stage";
import { useRevealSequence } from "./useRevealSequence";

function CloseButton({ onDark, className }: { onDark: boolean; className?: string }) {
  const navigate = useNavigate();
  return (
    <IconButton
      icon={<X size={24} weight="bold" />}
      label="Close"
      onClick={() => navigate("/check")}
      className={cn(
        "absolute left-3 top-3 z-30",
        onDark ? "text-current hover:bg-white/15" : "text-ink hover:bg-sunken",
        className,
      )}
    />
  );
}

function RevealScene({ verdict }: { verdict: Verdict }) {
  const reduced = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { phase, count, suspicious, runId, skip, replay } = useRevealSequence(verdict, reduced, canvasRef);
  const meta = tierMeta[verdict.tier];
  const shake = !reduced && verdict.tier === "high" && phase === "slam";
  const revealed = phase === "slam" || phase === "result";
  const closeColour = revealed ? meta.textOnFaceClass : "text-white";

  return (
    <AppColumn>
      <motion.div
        className="absolute inset-0"
        animate={{ x: shake ? [0, -10, 10, -6, 6, 0] : 0 }}
        transition={{ duration: 0.4 }}
        onClick={skip}
      >
        <Stage verdict={verdict} phase={phase} count={count} suspicious={suspicious} runId={runId} reduced={reduced} />
        {phase === "result" && (
          <motion.div
            key={`panel-${runId}`}
            className="absolute inset-x-0 bottom-0 h-[60%] overflow-y-auto rounded-t-lg bg-canvas"
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            transition={reduced ? { duration: 0.15 } : spring.sheet}
          >
            <RevealResult verdict={verdict} onReplay={replay} />
          </motion.div>
        )}
      </motion.div>
      {(phase === "suspense" || phase === "countdown") && (
        <button
          type="button"
          onClick={skip}
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-4 focus-visible:left-1/2 focus-visible:z-30 focus-visible:-translate-x-1/2 focus-visible:rounded-md focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-ink"
        >
          Skip to verdict
        </button>
      )}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
      <CloseButton onDark className={closeColour} />
    </AppColumn>
  );
}

export function RevealPage() {
  const { checkId = "" } = useParams();
  const verdict = useAppStore((s) => s.getCheck(checkId));

  if (!verdict) {
    return (
      <AppColumn>
        <CloseButton onDark={false} />
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState
            mood="sad"
            title="This check has expired"
            body="Run it again from the Check screen."
            action={<LinkButton to="/check">Back to Check</LinkButton>}
          />
        </div>
      </AppColumn>
    );
  }
  return <RevealScene key={verdict.checkId} verdict={verdict} />;
}
