import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RETAILERS } from "@shared/retailers";
import type { GeoPoint, RetailerId, Verdict } from "@shared/types";

export interface UserLocation { point: GeoPoint; label: string; source: "gps" | "default" }
export const DEFAULT_LOCATION: UserLocation = { point: { lat: 49.2781, lng: -122.9199 }, label: "SFU Burnaby", source: "default" };

export type PriceDisplay = "unit" | "package";

interface AppState {
  priceDisplay: PriceDisplay;
  setPriceDisplay: (mode: PriceDisplay) => void;
  recentChecks: Verdict[];
  addCheck: (v: Verdict) => void;
  getCheck: (id: string) => Verdict | undefined;
  clearChecks: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  /** stores the user does not shop at; hidden from the store pickers */
  hiddenStores: RetailerId[];
  toggleStore: (id: RetailerId) => void;
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
}

/** v1 -> v2: Metro, Voila and Galleria were removed; drop anything that still points at them. */
export function migrateAppState(persisted: unknown, version: number): unknown {
  if (!persisted || typeof persisted !== "object" || version >= 2) return persisted;
  const known = new Set<string>(RETAILERS.map((r) => r.id));
  const ok = (id: unknown) => id === undefined || (typeof id === "string" && known.has(id));
  const s = persisted as { hiddenStores?: unknown; recentChecks?: unknown };
  const hiddenStores = Array.isArray(s.hiddenStores) ? s.hiddenStores.filter((id) => typeof id === "string" && known.has(id)) : [];
  const recentChecks = Array.isArray(s.recentChecks)
    ? s.recentChecks.filter((c: { input?: { retailerId?: unknown }; best?: { retailerId?: unknown } }) => ok(c?.input?.retailerId) && ok(c?.best?.retailerId))
    : [];
  return { ...s, hiddenStores, recentChecks };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      priceDisplay: "package",
      setPriceDisplay: (priceDisplay) => set({ priceDisplay }),
      recentChecks: [],
      addCheck: (v) => set((s) => ({ recentChecks: [v, ...s.recentChecks.filter((c) => c.checkId !== v.checkId)].slice(0, 20) })),
      getCheck: (id) => get().recentChecks.find((c) => c.checkId === id),
      clearChecks: () => set({ recentChecks: [] }),
      soundOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      hiddenStores: [],
      toggleStore: (id) =>
        set((s) => ({ hiddenStores: s.hiddenStores.includes(id) ? s.hiddenStores.filter((x) => x !== id) : [...s.hiddenStores, id] })),
      location: DEFAULT_LOCATION,
      setLocation: (location) => set({ location }),
    }),
    { name: "realdeal", version: 2, migrate: (s, v) => migrateAppState(s, v) as AppState },
  ),
);
