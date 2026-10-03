// FOUNDATION helper for placeholder pages. Delete usages as real screens land.
import type { ReactNode } from "react";
import { Penny } from "@/components/penny";

export function Placeholder({ name, spec, children }: { name: string; spec: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
      <Penny mood="idle" size={96} />
      <h1 className="font-display text-h1 font-bold">{name}</h1>
      <p className="text-small text-ink-soft">Placeholder. Built by {spec}.</p>
      {children}
    </div>
  );
}
