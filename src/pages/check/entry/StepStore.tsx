import { useEffect, useRef, useState } from "react";
import type { RetailerId } from "@shared/types";
import { RETAILERS } from "@shared/retailers";
import { StoreTile } from "@/components/ui/StoreTile";
import { play } from "@/lib/sfx";

export interface StepStoreProps {
  selectedId: RetailerId | null;
  onSelect: (retailerId: RetailerId) => void;
}

export function StepStore({ selectedId, onSelect }: StepStoreProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Show the choice immediately; the parent only hears about it after the 250ms beat
  const [pendingId, setPendingId] = useState<RetailerId | null>(null);
  const activeId = pendingId ?? selectedId;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTileClick = (id: RetailerId) => {
    play("tap");
    setPendingId(id);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSelect(id);
    }, 250);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="font-display text-h2 font-bold text-ink">Where are you shopping?</h2>
      <div className="grid grid-cols-2 gap-3.5">
        {RETAILERS.map((retailer) => {
          const isSelected = activeId === retailer.id;
          const isFaded = activeId !== null && !isSelected;
          return (
            <StoreTile
              key={retailer.id}
              retailer={retailer}
              size="lg"
              selected={isSelected}
              onClick={() => handleTileClick(retailer.id)}
              className={isFaded ? "opacity-60 transition-opacity" : "transition-opacity"}
            />
          );
        })}
      </div>
    </div>
  );
}