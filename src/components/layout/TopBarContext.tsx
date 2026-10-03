// FROZEN API (SPEC-00). Pages call useTopBar({ title, back, right }) to configure the shell's top bar.
import { createContext, useContext, useEffect, type ReactNode } from "react";

export interface TopBarConfig { title?: string; back?: boolean; right?: ReactNode; hidden?: boolean }
export const TopBarContext = createContext<(c: TopBarConfig) => void>(() => undefined);

export function useTopBar(config: TopBarConfig): void {
  const set = useContext(TopBarContext);
  const { title, back, right, hidden } = config;
  useEffect(() => {
    set({ title, back, right, hidden });
    return () => set({});
  }, [set, title, back, right, hidden]);
}
