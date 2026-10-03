// STUB (SPEC-00). UI-01 replaces; props are final.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonClass, type ButtonVisualProps } from "./Button";

export interface LinkButtonProps extends ButtonVisualProps { to: string; children: ReactNode }

export function LinkButton({ to, children, leftIcon, ...visual }: LinkButtonProps) {
  return (
    <Link to={to} className={buttonClass(visual)}>
      {leftIcon}
      {children}
    </Link>
  );
}
