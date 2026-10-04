import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

export interface SheetProps { open: boolean; onClose: () => void; title?: string; children: ReactNode }

const focusableSelector = [
  "a[href]", "button", "input:not([type='hidden'])", "select", "textarea",
  "[tabindex]", "[contenteditable='true']",
].join(",");

function SheetContent({ onClose, title, children }: Omit<SheetProps, "open">) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();

  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => element.tabIndex >= 0 && !element.matches(":disabled")
        && !element.closest("[hidden], [inert], [aria-hidden='true']")
        && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
    const focusFirst = () => (focusable()[0] ?? dialog).focus({ preventScroll: true });
    focusFirst();
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusFirst();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div className="absolute inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <div className="absolute inset-0 bg-ink/55" aria-hidden="true" onClick={onClose} />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Details"}
        tabIndex={-1}
        className="relative flex max-h-[85%] w-full flex-col rounded-t-lg bg-canvas text-ink"
        initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        transition={reducedMotion ? { duration: 0.15 } : spring.sheet}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.65 }}
        dragMomentum={false}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
      >
        <div className="flex h-12 shrink-0 touch-none items-center justify-center" aria-hidden="true" onPointerDown={(event) => dragControls.start(event)}>
          <div className="h-1.5 w-12 rounded-full bg-line-strong" />
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
          {title && <h2 id={titleId} className="mb-4 font-display text-h2 font-semibold">{title}</h2>}
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (typeof document === "undefined") return null;
  const column = document.getElementById("app-column");
  return createPortal(
    <div className={column ? "absolute inset-0 z-50 pointer-events-none [&>*]:pointer-events-auto" : "fixed inset-0 z-50 pointer-events-none [&>*]:pointer-events-auto"}>
      <AnimatePresence>
        {open && <SheetContent key="sheet" onClose={onClose} title={title}>{children}</SheetContent>}
      </AnimatePresence>
    </div>,
    column ?? document.body,
  );
}
