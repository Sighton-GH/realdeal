// STUB (SPEC-00). UI-05 replaces; API is final.
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { VerdictTier } from "@shared/types";

export interface ToastOptions { message: string; tone?: "brand" | VerdictTier }
export interface ToastContextValue { show: (opts: ToastOptions) => void }

const ToastContext = createContext<ToastContextValue>({ show: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const show = useCallback((opts: ToastOptions) => {
    setToast(opts);
    window.setTimeout(() => setToast(null), 2800);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div role="status" className="lifted fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-canvas px-5 py-3 font-extrabold">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => useContext(ToastContext);
