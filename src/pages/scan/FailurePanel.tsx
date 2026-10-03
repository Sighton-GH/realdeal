import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { Penny } from "@/components/penny";
import type { PennyMood } from "@/components/penny/types";
import { cn } from "@/lib/cn";

export interface FailureAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

export interface FailurePanelProps {
  mood: PennyMood;
  message: string;
  /** first action is the primary one, the rest are secondary */
  actions: FailureAction[];
  /** dim whatever is behind the panel (used over a frozen photo) */
  dim?: boolean;
}

export function FailurePanel({ mood, message, actions, dim }: FailurePanelProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-5", dim && "bg-ink/55")}>
      <div role="alert" className="lifted pointer-events-auto flex w-full max-w-[400px] flex-col items-center gap-4 rounded-lg bg-canvas p-5 text-center text-ink">
        <Penny mood={mood} size={96} />
        <p className="text-body">{message}</p>
        <div className="flex w-full flex-col gap-3">
          {actions.map((a, i) => (
            <Button key={a.label} variant={i === 0 ? "primary" : "secondary"} fullWidth leftIcon={a.icon} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
