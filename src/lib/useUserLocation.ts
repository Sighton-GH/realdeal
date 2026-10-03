import { useCallback, useState } from "react";
import { useAppStore, type UserLocation } from "@/store/useAppStore";

export type LocationStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";

/** The user's position, with an SFU Burnaby fallback. Never prompts until request() is called. Needs HTTPS or localhost. */
export function useUserLocation(): UserLocation & { status: LocationStatus; request: () => void } {
  const location = useAppStore((s) => s.location);
  const setLocation = useAppStore((s) => s.setLocation);
  const [status, setStatus] = useState<LocationStatus>(location.source === "gps" ? "granted" : "idle");

  const request = useCallback(() => {
    if (!("geolocation" in navigator) || !window.isSecureContext) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ point: { lat: pos.coords.latitude, lng: pos.coords.longitude }, label: "Your location", source: "gps" });
        setStatus("granted");
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, [setLocation]);

  return { ...location, status, request };
}
