import { Link, NavLink, useLocation } from "react-router";
import { Detective, Scan, Tag } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const side = "flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-sm text-micro";
const activeClass = "font-extrabold text-grape-500";
const inactiveClass = "font-bold text-ink-soft";

export function BottomNav() {
  const { pathname } = useLocation();
  const checkActive = /^\/(?:check|item)(?:\/|$)/.test(pathname);

  const checkContent = (
    <>
      <Tag size={26} weight={checkActive ? "fill" : "bold"} aria-hidden="true" />
      <span>Check</span>
    </>
  );
  const checkClass = cn(side, checkActive ? activeClass : inactiveClass);

  return (
    <nav aria-label="Main" className="z-30 flex h-[calc(72px+env(safe-area-inset-bottom,0px))] shrink-0 items-stretch border-t-2 border-line bg-canvas pb-[env(safe-area-inset-bottom,0px)] md:h-[72px] md:pb-0">
      {/* NavLink only matches its destination. Item detail belongs to Check,
          so keep that section current without changing the destination. */}
      {pathname.startsWith("/item/") ? (
        <Link to="/check" aria-current="page" className={checkClass}>{checkContent}</Link>
      ) : (
        <NavLink to="/check" className={checkClass}>{checkContent}</NavLink>
      )}
      <NavLink to="/scan" className="flex min-w-12 flex-1 flex-col items-center gap-2 rounded-sm text-micro font-extrabold text-grape-500">
        <span className="press -mt-[18px] flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-grape-500 text-white [--lip:var(--color-grape-700)] motion-reduce:transition-none motion-reduce:active:transform-none">
          <Scan size={30} weight="bold" aria-hidden="true" />
        </span>
        <span>Scan</span>
      </NavLink>
      <NavLink to="/tricks" className={({ isActive }) => cn(side, isActive ? activeClass : inactiveClass)}>
        {({ isActive }) => (
          <>
            <Detective size={26} weight={isActive ? "fill" : "bold"} aria-hidden="true" />
            <span>Tricks</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
