import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { retailerById, RETAILERS } from "@shared/retailers";
import type { Category, RetailerId } from "@shared/types";
import { api } from "@/api/client";
import { useTopBar } from "@/components/layout";
import { Chip, EmptyState, PriceText, Skeleton } from "@/components/ui";
import { ItemRow } from "@/components/domain";

import { useAppStore } from "@/store/useAppStore";
import { displayedPrice } from "@/lib/priceDisplay";

const CATEGORIES: Array<{ id: Category | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "dairy", label: "Dairy" },
  { id: "produce", label: "Produce" },
  { id: "bakery", label: "Bakery" },
  { id: "pantry", label: "Pantry" },
  { id: "meat", label: "Meat" },
  { id: "seafood", label: "Seafood" },
  { id: "frozen", label: "Frozen" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
  { id: "household", label: "Household" },
];

export function StoreDetailPage() {
  const priceDisplay = useAppStore((s) => s.priceDisplay);
  const { retailerId } = useParams();
  const known = RETAILERS.some((r) => r.id === retailerId);
  const retailer = known ? retailerById(retailerId as RetailerId) : undefined;
  useTopBar({ title: retailer?.shortName ?? "Store", back: true });
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | "all">("all");
  const rows = useQuery({
    queryKey: ["store-items", retailerId],
    queryFn: () => api.getStoreItems(retailerId as RetailerId),
    enabled: known,
  });

  if (!retailer) {
    return <div className="px-5 py-6"><EmptyState mood="sad" title="Penny doesn't know that store" body="Pick one from the Stores tab." /></div>;
  }
  const shown = (rows.data ?? []).filter((r) => category === "all" || r.item.category === category);

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <header>
        <h1 className="font-display text-h1 font-bold">{retailer.name}</h1>
        <p className="text-body text-ink-soft">Latest price we have for each item. Tap one to check a price.</p>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</Chip>
        ))}
      </div>
      {rows.isPending && <Skeleton className="h-16 w-full" />}
      {rows.isError && <EmptyState mood="sad" title="Couldn't load prices" body="Try again in a moment." />}
      <ul className="flex flex-col gap-3">
        {shown.map((r) => (
          <li key={r.item.id}>
            <ItemRow
              item={r.item}
              onClick={() => navigate(`/check/${r.item.id}?store=${retailer.id}`)}
              right={
                <span className="flex flex-col items-end">
                  <PriceText {...displayedPrice(r.price, r.unitPrice, r.item, priceDisplay)} size="sm" />
                  <span className="text-micro font-bold text-ink-soft">
                    {r.onSale ? "sale · " : ""}{r.source === "seed" ? "sample" : "real"}
                  </span>
                </span>
              }
            />
          </li>
        ))}
      </ul>
      {rows.data && shown.length === 0 && <EmptyState mood="meh" title="Nothing here yet" body="No prices for that category at this store." />}
    </div>
  );
}
