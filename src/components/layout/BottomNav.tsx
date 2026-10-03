// STUB (SPEC-00). UI-07 replaces; props are final.
import { NavLink } from "react-router";
import { Detective, Scan, Tag } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const side = "flex flex-1 flex-col items-center justify-center gap-0.5 text-micro font-bold";

export function BottomNav() {
  return (
    <nav aria-label="Main" className="sticky bottom-0 z-30 flex h-[72px] shrink-0 items-stretch border-t-2 border-line bg-canvas pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/check" end className={({ isActive }) => cn(side, isActive ? "text-grape-500 font-extrabold" : "text-ink-soft")}>
        {({ isActive }) => (<><Tag size={26} weight={isActive ? "fill" : "bold"} />Check</>)}
      </NavLink>
      <NavLink to="/scan" className="flex flex-1 flex-col items-center text-micro font-extrabold text-grape-500">
        <span className="press -mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-grape-500 text-white [--lip:var(--color-grape-700)]">
          <Scan size={30} weight="bold" />
        </span>
        Scan
      </NavLink>
      <NavLink to="/tricks" className={({ isActive }) => cn(side, isActive ? "text-grape-500 font-extrabold" : "text-ink-soft")}>
        {({ isActive }) => (<><Detective size={26} weight={isActive ? "fill" : "bold"} />Tricks</>)}
      </NavLink>
    </nav>
  );
}
