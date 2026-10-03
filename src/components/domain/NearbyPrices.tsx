// STUB (SPEC-00). SCR-12 replaces; props are final.
import { useQuery } from "@tanstack/react-query";
import type { RetailerId } from "@shared/types";
import { api } from "@/api/client";
import { Section, Skeleton, VerdictBadge } from "@/components/ui";
import { formatDistance, formatMoney } from "@/lib/format";
import { useUserLocation } from "@/lib/useUserLocation";

export interface NearbyPricesProps { itemId: string; checkedPrice?: { retailerId: RetailerId; unitPrice: number }; limit?: number; title?: string; className?: string }

export function NearbyPrices({ itemId, limit = 6, title = "Prices near you", className }: NearbyPricesProps) {
  const { point } = useUserLocation();
  const q = useQuery({ queryKey: ["nearby", itemId, point.lat.toFixed(3), point.lng.toFixed(3), limit], queryFn: () => api.getNearbyPrices(itemId, point, limit) });
  return (
    <Section title={title} className={className}>
      {q.isPending && <Skeleton className="h-16" />}
      {q.data?.map((n) => (
        <div key={n.store.id} className="lifted flex items-center gap-3 rounded-md p-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-extrabold">{n.store.name}</div>
            <div className="text-small text-ink-soft">{formatDistance(n.distanceKm)}</div>
          </div>
          <span className="font-display font-bold">{formatMoney(n.price)}</span>
          <VerdictBadge tier={n.tier} />
        </div>
      ))}
    </Section>
  );
}
