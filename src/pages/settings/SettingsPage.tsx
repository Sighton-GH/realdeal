import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { RETAILERS } from "@shared/retailers";
import { ITEMS } from "@shared/seed/items";
import { api } from "@/api/client";
import { useTopBar } from "@/components/layout";
import { Button, Chip, Toggle } from "@/components/ui";
import { DataFreshness } from "@/components/domain";
import { useAppStore } from "@/store/useAppStore";

export function SettingsPage() {
  useTopBar({ title: "Settings" });
  const soundOn = useAppStore((s) => s.soundOn);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const hidden = useAppStore((s) => s.hiddenStores);
  const toggleStore = useAppStore((s) => s.toggleStore);
  const checks = useAppStore((s) => s.recentChecks.length);
  const clearChecks = useAppStore((s) => s.clearChecks);
  const status = useQuery({ queryKey: ["status"], queryFn: () => api.getDataStatus() });

  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <h1 className="font-display text-h1 font-bold">Settings</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-h3 font-extrabold">Sound</h2>
        <Toggle checked={soundOn} onChange={toggleSound} label="Sound effects and voice" description="Reveal sounds and Penny's spoken verdicts." />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-h3 font-extrabold">My stores</h2>
        <p className="text-small font-bold text-ink-soft">Untick the stores you don't shop at. They are hidden from the store pickers when you check or scan a price. Price comparisons still cover every store.</p>
        <div className="flex flex-wrap gap-2">
          {RETAILERS.map((r) => (
            <Chip key={r.id} selected={!hidden.includes(r.id)} onClick={() => toggleStore(r.id)}>{r.shortName}</Chip>
          ))}
        </div>
        {hidden.length >= RETAILERS.length && <p className="text-small font-bold text-ink-soft">All stores are hidden, so every store is shown.</p>}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-h3 font-extrabold">Your history</h2>
        <p className="text-small font-bold text-ink-soft">{checks} recent {checks === 1 ? "check" : "checks"} saved on this device.</p>
        <Button variant="secondary" onClick={clearChecks} disabled={checks === 0}>Clear history</Button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-h3 font-extrabold">Data</h2>
        <p className="text-small font-bold text-ink-soft">
          {ITEMS.length} items across {RETAILERS.length} stores. Sources: {status.data ? status.data.sources.join(", ") : "loading"}
          {status.data ? ` (${status.data.mode} mode)` : ""}. Real prices come from Project Hammer; "sample" prices are generated filler.
        </p>
        <DataFreshness />
      </section>

      <Link to="/about" className="inline-flex min-h-12 items-center font-display text-body font-semibold text-grape-500 underline underline-offset-4">
        About RealDeal
      </Link>
    </div>
  );
}
