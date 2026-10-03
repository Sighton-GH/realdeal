// STUB (SPEC-00). UI-05 replaces; props are final. (Final version portals into the app column.)
import type { ReactNode } from "react";
import { useEffect } from "react";

export interface SheetProps { open: boolean; onClose: () => void; title?: string; children: ReactNode }

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/55" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-[460px] rounded-t-lg bg-canvas p-5 pb-8">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line-strong" />
        {title && <h2 className="mb-4 font-display text-h2 font-semibold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
