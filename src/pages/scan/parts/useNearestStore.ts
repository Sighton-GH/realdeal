import { useQuery } from "@tanstack/react-query";
import type { StoreLocation } from "@shared/types";
import { api } from "@/api/client";
import { useUserLocation } from "@/lib/useUserLocation";

const AT_STORE_KM = 0.3;

/** The branch the user is standing in, when GPS says they are within 300 m of one. */
export function useNearestStore() {
  const location = useUserLocation();
  const { point, source, status, request } = location;
  const query = useQuery({
    queryKey: ["scan-nearest-store", point.lat, point.lng],
    queryFn: () => api.getNearbyPrices("milk-2pct-4l", point, 1),
    enabled: source === "gps",
    staleTime: 5 * 60_000,
  });
  const nearest = query.data?.[0];
  const suggested: StoreLocation | undefined =
    source === "gps" && nearest && nearest.distanceKm <= AT_STORE_KM ? nearest.store : undefined;
  return { suggested, locating: status === "locating", usingGps: source === "gps", requestLocation: request };
}
