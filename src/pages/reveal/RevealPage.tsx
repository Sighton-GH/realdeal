// PLACEHOLDER (SPEC-00). SCR-07 + SCR-08 replace.
import { useParams } from "react-router";
import { AppColumn } from "@/components/layout";
import { LinkButton, VerdictBadge } from "@/components/ui";
import { Penny } from "@/components/penny";
import { TrickCard } from "@/components/domain";
import { formatPct } from "@/lib/format";
import { pennyLineFor, tierMeta } from "@/lib/tier";
import { useAppStore } from "@/store/useAppStore";

export function RevealPage() {
  const { checkId = "" } = useParams();
  const verdict = useAppStore((s) => s.getCheck(checkId));
  return (
    <AppColumn>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {verdict ? (
          <>
            <div className={`flex flex-col items-center gap-2 rounded-lg p-6 ${tierMeta[verdict.tier].bgClass} ${tierMeta[verdict.tier].textOnFaceClass}`}>
              <Penny mood={tierMeta[verdict.tier].mood} size={120} />
              <p className="font-display text-verdict font-bold">{tierMeta[verdict.tier].label}</p>
              <p className="font-extrabold">{formatPct(verdict.pctVsAvg)}</p>
            </div>
            <VerdictBadge tier={verdict.tier} size="md" />
            <p>{pennyLineFor(verdict)}</p>
            {verdict.tricks.map((t) => <TrickCard key={t.type} trick={t} />)}
          </>
        ) : (
          <p>This check has expired.</p>
        )}
        <LinkButton to="/check" fullWidth>Check another</LinkButton>
      </div>
    </AppColumn>
  );
}
