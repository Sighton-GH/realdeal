import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sfx";
import { buttonClass, type ButtonVisualProps } from "./Button";

export interface LinkButtonProps extends ButtonVisualProps { to: string; children: ReactNode }

export function LinkButton({ to, children, leftIcon, loading, ...visual }: LinkButtonProps) {
  const reducedMotion = useReducedMotion();
  return (
    <Link
      to={to}
      className={buttonClass(visual)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      tabIndex={loading ? -1 : undefined}
      onClick={(event) => {
        if (loading) { event.preventDefault(); return; }
        play("tap");
      }}
    >
      <span className={cn("inline-flex items-center justify-center gap-2.5", loading && "invisible")} aria-hidden={loading || undefined}>
        {leftIcon && <span aria-hidden="true" className="inline-flex size-[22px] shrink-0 items-center justify-center [&_svg]:size-[22px]">{leftIcon}</span>}
        {children}
      </span>
      {loading && <>
        <span className="sr-only">{children}</span>
        <span role="status" className="sr-only">Loading</span>
        <span aria-hidden="true" className="absolute inset-0 inline-flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((dot) => <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-current"
            animate={reducedMotion ? { opacity: [0.35, 1, 0.35] } : { y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />)}
        </span>
      </>}
    </Link>
  );
}
