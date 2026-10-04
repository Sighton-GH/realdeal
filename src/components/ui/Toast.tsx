import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Equals, Info, Lightning, ThumbsUp, WarningCircle } from "@phosphor-icons/react";
import type { VerdictTier } from "@shared/types";
import { spring } from "@/lib/motion";

export interface ToastOptions { message: string; tone?: "brand" | VerdictTier }
export interface ToastContextValue { show: (opts: ToastOptions) => void }

const ToastContext = createContext<ToastContextValue>({ show: () => undefined });
const tones = {
  brand: { icon: Info, colour: "text-grape-500" },
  steal: { icon: Lightning, colour: "text-steal" },
  good: { icon: ThumbsUp, colour: "text-good" },
  normal: { icon: Equals, colour: "text-normal" },
  high: { icon: WarningCircle, colour: "text-high" },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const reducedMotion = useReducedMotion();
  const show = useCallback((opts: ToastOptions) => {
    if (timer.current !== null) clearTimeout(timer.current);
    setToast({ ...opts, id: ++nextId.current });
    timer.current = setTimeout(() => {
      setToast(null);
      timer.current = null;
    }, 2800);
  }, []);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  const value = useMemo(() => ({ show }), [show]);
  const column = typeof document === "undefined" ? null : document.getElementById("app-column");
  const tone = tones[toast?.tone ?? "brand"];
  const ToneIcon = tone.icon;
  const overlay = (
    <div className={column ? "pointer-events-none absolute inset-x-0 top-[68px] z-40 flex justify-center px-5" : "pointer-events-none fixed inset-x-0 top-[68px] z-40 flex justify-center px-5"}>
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="lifted flex max-w-full items-center gap-3 rounded-full bg-canvas px-5 py-3 font-body font-extrabold text-ink"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0.15 } : spring.pop}
          >
            <ToneIcon size={24} weight="bold" aria-hidden="true" className={`shrink-0 ${tone.colour}`} />
            <span className="min-w-0 break-words">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" && createPortal(overlay, column ?? document.body)}
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => useContext(ToastContext);
