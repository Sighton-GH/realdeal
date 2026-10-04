import { useState } from "react";
import { TRICKS } from "@shared/content/tricks";
import type { TrickType } from "@shared/types";
import { useTopBar } from "@/components/layout";
import { Penny } from "@/components/penny";
import { TrickPanel } from "./TrickPanel";

export function TricksPage() {
  useTopBar({});
  const [openType, setOpenType] = useState<TrickType | null>(TRICKS[0]?.type ?? null);

  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <header className="flex items-center gap-3">
        <Penny mood="suspicious" size={96} />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-h1 font-bold">The Trick Files</h1>
          <p className="text-body text-ink-soft">Four ways a price tag can make a normal price look like a deal.</p>
        </div>
      </header>
      <div className="flex flex-col gap-3">
        {TRICKS.map((trick) => (
          <TrickPanel
            key={trick.type}
            trick={trick}
            open={openType === trick.type}
            onToggle={() => setOpenType(openType === trick.type ? null : trick.type)}
          />
        ))}
      </div>
      <p className="text-small text-ink-soft">
        Tricks are flagged from weekly prices. A flag means 'look closer', not 'the store broke a rule'.
      </p>
    </div>
  );
}
