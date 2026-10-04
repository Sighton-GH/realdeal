import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useMyRetailers } from "@/lib/useMyRetailers";
import { useUserLocation } from "@/lib/useUserLocation";
import { orderRetailers } from "./storeOrder";

/** Store choices for the confirm sheet, nearest first when GPS is on. */
export function useStoreChoices(itemId: string | undefined) {
  const mine = useMyRetailers();
  const { point, source, status } = useUserLocation();
  const query = useQuery({
    queryKey: ["scan-store-choices", itemId, point.lat, point.lng],
    queryFn: () => api.getNearbyPrices(itemId ?? "", point, 50),
    enabled: source === "gps" && itemId !== undefined,
    staleTime: 5 * 60_000,
  });
  return { ...orderRetailers(mine, query.data ?? []), locating: status === "locating" || query.isFetching };
}
