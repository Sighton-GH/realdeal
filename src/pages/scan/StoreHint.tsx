import { useState } from "react";
import { MapPin } from "@phosphor-icons/react";
import type { RetailerId, StoreLocation } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { Chip, Sheet, StoreTile } from "@/components/ui";
import { useMyRetailers } from "@/lib/useMyRetailers";

export interface StoreHintProps {
  /** branch the user is standing in, from GPS */
  suggested?: StoreLocation;
  /** store picked by hand; wins over the suggestion */
  chosen?: RetailerId;
  locating?: boolean;
  usingGps?: boolean;
  onChoose: (id: RetailerId) => void;
  onUseLocation: () => void;
}

export function StoreHint({ suggested, chosen, locating, usingGps, onChoose, onUseLocation }: StoreHintProps) {
  const myRetailers = useMyRetailers();
  const [open, setOpen] = useState(false);
  let label = "Which store?";
  if (chosen) label = retailerById(chosen).name;
  else if (suggested) label = `At ${suggested.name}?`;

  return (
    <>
      <div className="flex justify-center px-5">
        <Chip selected={Boolean(chosen || suggested)} icon={<MapPin size={18} weight="bold" />} onClick={() => setOpen(true)} className="max-w-full min-h-12">
          <span className="truncate">{label}</span>
        </Chip>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Which store?">
        <div className="grid grid-cols-2 gap-3">
          {myRetailers.map((r) => (
            <StoreTile
              key={r.id}
              retailer={r}
              size="md"
              selected={(chosen ?? suggested?.retailerId) === r.id}
              onClick={() => {
                onChoose(r.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
        {!usingGps && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={locating}
            className="mt-4 min-h-12 text-small font-extrabold text-grape-500 underline underline-offset-4 disabled:text-ink-soft"
          >
            {locating ? "Finding you…" : "Use my location"}
          </button>
        )}
      </Sheet>
    </>
  );
}
