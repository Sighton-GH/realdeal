// PLACEHOLDER (SPEC-00). SCR-03 replaces. Demonstrates the data plumbing end to end.
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/client";
import { FlyerDealCard } from "@/components/domain";
import { Section } from "@/components/ui";
import { useTopBar } from "@/components/layout";
import { useRunCheck } from "./useRunCheck";

export function CheckHomePage() {
  useTopBar({});
  const featured = useQuery({ queryKey: ["featured"], queryFn: () => api.getFeatured() });
  const { run } = useRunCheck();
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <h1 className="font-display text-h1 font-bold">Check (placeholder)</h1>
      <Section title="Flyer deals to check">
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
          {featured.data?.map((deal) => (
            <FlyerDealCard
              key={deal.id}
              deal={deal}
              loading={busy === deal.id}
              onCheck={async (d) => {
                setBusy(d.id);
                await run({ itemId: d.item.id, retailerId: d.retailerId, price: d.price, wasPrice: d.wasPrice, multiBuy: d.multiBuy, sizeQty: d.sizeQty, source: "flyer" });
                setBusy(null);
              }}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
