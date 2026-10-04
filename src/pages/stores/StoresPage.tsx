import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { CaretRight } from "@phosphor-icons/react";
import { retailerById } from "@shared/retailers";
import type { StoreSummary, TileColour } from "@shared/types";
import { api } from "@/api/client";
import { useTopBar } from "@/components/layout";
import { EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatWeek } from "@/lib/format";

export const storeDot: Record<TileColour, string> = { tangerine: "bg-tangerine", pink: "bg-pink", teal: "bg-teal", violet: "bg-violet" };

export function sourceLabel(s: StoreSummary): string {
  if (s.itemCount === 0) return "No prices yet";
  if (s.realItemCount === 0) return "Sample prices only";
  if (s.realItemCount === s.itemCount) return "Real prices (Project Hammer)";
  return "Mix of real and sample prices";
}

export function StoresPage() {
  useTopBar({ title: "Stores" });
  const navigate = useNavigate();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => api.getStores() });

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-h1 font-bold">Stores</h1>
        <p className="text-body text-ink-soft">Every chain RealDeal compares. Tap one to see its prices.</p>
      </header>
      {stores.isPending && <Skeleton className="h-24 w-full" />}
      {stores.isError && <EmptyState mood="sad" title="Couldn't load stores" body="Try again in a moment." />}
      <ul className="flex flex-col gap-3">
        {stores.data?.map((s) => {
          const r = retailerById(s.retailerId);
          return (
            <li key={s.retailerId}>
              <button
                type="button"
                onClick={() => navigate(`/stores/${s.retailerId}`)}
                className="lifted flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-md bg-canvas p-3 text-left"
              >
                <span aria-hidden="true" className={cn("size-10 shrink-0 rounded-md", storeDot[r.tile])} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-h3 font-extrabold">{r.name}</span>
                  <span className="block text-small font-bold text-ink-soft">
                    {s.itemCount === 0 ? "No items yet" : `${s.realItemCount} of ${s.itemCount} items real${s.latestDate ? ` · updated ${formatWeek(s.latestDate)}` : ""}`}
                  </span>
                  <span className="block text-small text-ink-soft">
                    {s.itemCount === 0 ? "Run the Hammer import to add this store." : `${sourceLabel(s)} · ${s.weeksOfData} weeks`}
                  </span>
                </span>
                <CaretRight aria-hidden="true" size={20} weight="bold" className="shrink-0 text-ink-soft" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
