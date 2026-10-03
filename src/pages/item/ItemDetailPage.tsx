// PLACEHOLDER (SPEC-00). SCR-10 replaces.
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { api } from "@/api/client";
import { NearbyPrices, PriceHistoryChart } from "@/components/domain";
import { useTopBar } from "@/components/layout";

export function ItemDetailPage() {
  const { itemId = "" } = useParams();
  useTopBar({ back: true });
  const q = useQuery({ queryKey: ["item", itemId], queryFn: () => api.getItem(itemId) });
  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <h1 className="font-display text-h1 font-bold">{q.data?.item.name ?? "Item"}</h1>
      {q.data && <PriceHistoryChart detail={q.data} mode="unit" />}
      <NearbyPrices itemId={itemId} />
    </div>
  );
}
