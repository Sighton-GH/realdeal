import { useQuery } from "@tanstack/react-query";
import type { Verdict } from "@shared/types";
import { api } from "@/api/client";
import { PriceHistoryChart } from "@/components/domain";
import { LinkButton, Section, Skeleton } from "@/components/ui";

import { useAppStore } from "@/store/useAppStore";

export function HistorySection({ verdict }: { verdict: Verdict }) {
  const mode = useAppStore((s) => s.priceDisplay);
  const itemId = verdict.item.id;
  const q = useQuery({ queryKey: ["item", itemId], queryFn: () => api.getItem(itemId) });
  return (
    <Section
      title="Price history"
      action={
        <LinkButton to={"/item/" + itemId} variant="ghost" size="md">
          Full history
        </LinkButton>
      }
    >
      {q.isPending && <Skeleton className="h-[140px]" />}
      {q.isError && <p className="text-small text-ink-soft">Couldn't load the price history. Check your connection and try again.</p>}
      {q.data && (
        <PriceHistoryChart
          detail={q.data}
          mode={mode}
          focusRetailer={verdict.input.retailerId}
          compact
          markPrice={mode === "unit" ? verdict.unitPrice : verdict.unitPrice * (verdict.input.sizeQty ?? verdict.item.sizeQty)}
          markTier={verdict.tier}
        />
      )}
    </Section>
  );
}
