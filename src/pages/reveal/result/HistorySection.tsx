import { useQuery } from "@tanstack/react-query";
import type { Verdict } from "@shared/types";
import { api } from "@/api/client";
import { PriceHistoryChart } from "@/components/domain";
import { LinkButton, Section, Skeleton } from "@/components/ui";

export function HistorySection({ verdict }: { verdict: Verdict }) {
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
          mode="unit"
          focusRetailer={verdict.input.retailerId}
          compact
          markPrice={verdict.unitPrice}
          markTier={verdict.tier}
        />
      )}
    </Section>
  );
}
