import { useQuery } from "@tanstack/react-query";
import { Broadcast, Clock } from "@phosphor-icons/react";
import { retailerById } from "@shared/retailers";
import { api } from "@/api/client";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";

export function DataFreshness({ compact, className }: { compact?: boolean; className?: string }) {
  const query = useQuery({ queryKey: ["status"], queryFn: () => api.getDataStatus() });
  if (query.isPending || query.isError || !query.data) return null;

  const { updatedAt, sources, retailers } = query.data;
  const liveStores = retailers.filter((retailer) => retailer.ok && retailer.lastScrapedAt).length;

  return (
    <div className={cn("min-w-0 text-small font-bold text-ink-soft", !compact && "py-2", className)}>
      <div className={cn("flex items-center gap-x-4 gap-y-1.5", compact ? "flex-nowrap overflow-x-auto" : "flex-wrap")}>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
          <Clock aria-hidden="true" size={16} weight="bold" className="shrink-0" />
          Prices updated {formatRelativeTime(updatedAt)}
        </span>
        {sources.includes("scrape") && <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
          <Broadcast aria-hidden="true" size={16} weight="bold" className="shrink-0" />
          live prices from {liveStores} stores
        </span>}
      </div>
      {!compact && retailers.some((retailer) => !retailer.ok) && <ul className="mt-1.5 space-y-1">
        {retailers.filter((retailer) => !retailer.ok).map((retailer) => (
          <li key={retailer.retailerId}>{retailerById(retailer.retailerId).name}: using saved prices</li>
        ))}
      </ul>}
    </div>
  );
}
