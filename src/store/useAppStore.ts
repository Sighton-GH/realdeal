import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeoPoint, Verdict } from "@shared/types";

export interface UserLocation { point: GeoPoint; label: string; source: "gps" | "default" }
export const DEFAULT_LOCATION: UserLocation = { point: { lat: 49.2781, lng: -122.9199 }, label: "SFU Burnaby", source: "default" };

interface AppState {
  recentChecks: Verdict[];
  addCheck: (v: Verdict) => void;
  getCheck: (id: string) => Verdict | undefined;
  clearChecks: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      recentChecks: [],
      addCheck: (v) => set((s) => ({ recentChecks: [v, ...s.recentChecks.filter((c) => c.checkId !== v.checkId)].slice(0, 20) })),
      getCheck: (id) => get().recentChecks.find((c) => c.checkId === id),
      clearChecks: () => set({ recentChecks: [] }),
      soundOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      location: DEFAULT_LOCATION,
      setLocation: (location) => set({ location }),
    }),
    { name: "realdeal", version: 1 },
  ),
);
